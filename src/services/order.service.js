// services/order.service.js
const prisma = require('../prisma/prisma');
const logger = require('../config/logger');
const { OrderStatus, ProductionStepStatus, CompanyRole } = require('@prisma/client');
const { subBusinessDays } = require('date-fns');

const planOrderWorkflow = async (createdOrder, quote, tx) => {
    const orderId = createdOrder.id;
    const companyId = createdOrder.companyId;
    logger.info(`Starten met het plannen van workflow voor order ${orderId}.`);

    try {
        const workflowDef = quote?.productTemplate?.workflowDefinition;
        if (!workflowDef || !Array.isArray(workflowDef.nodes)) {
            await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.ON_HOLD } });
            logger.warn(`Geen geldige workflow-definitie gevonden voor order ${orderId}. Order in de wacht gezet.`);
            return;
        }

        const companyOwner = await tx.user.findFirst({
            where: {
                companyId: companyId,
                companyRole: CompanyRole.owner,
            },
        });

        if (!companyOwner) {
            await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.ON_HOLD } });
            logger.error(`Geen eigenaar gevonden voor bedrijf ${companyId} om taken aan toe te wijzen. Order ${orderId} in de wacht gezet.`);
            return;
        }
        const defaultAssigneeId = companyOwner.id;

        const calculationDetails = quote.calculationResult?.lines?.[0]?.calculationDetails || {};
        const durations = calculationDetails.durations || {};
        logger.info(`Gecalculeerde duraies uit offerte geladen voor order ${orderId}.`);

        const workflowSteps = workflowDef.nodes
            .filter(n => n?.data?.type && !['Start', 'Einde'].includes(n.data.type))
            .sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0))
            .map((node, index) => {
                const calculatedDuration = durations[node.id];
                const plannedDurationHours = (typeof calculatedDuration === 'number' && calculatedDuration > 0) ? calculatedDuration : 1.0;
                
                if (typeof calculatedDuration !== 'number' || calculatedDuration <= 0) {
                     logger.warn(`Geen berekende duur gevonden voor node ${node.id} ('${node.data.label}'). Standaard duur van 1 uur ingesteld.`);
                }

                return {
                    title: node.data.label || 'Onbekende stap',
                    notes: `Stap van type ${node.data.type || 'onbekend'}`,
                    order: index + 1,
                    resourceId: node.data.resourceId || null,
                    resourceType: node.data.type || null,
                    plannedDurationHours: plannedDurationHours
                };
            });

        if (workflowSteps.length === 0) {
            await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.ON_HOLD } });
            logger.warn(`Geen verwerkbare workflow-stappen gevonden voor order ${orderId}. Order in de wacht gezet.`);
            return;
        }

        const stepsToCreate = workflowSteps.map(s => ({ ...s, orderId: orderId }));

        const productionLeadTime = 5;
        const autoStartDate = createdOrder.leverdatum ? subBusinessDays(new Date(createdOrder.leverdatum), productionLeadTime) : new Date();

        stepsToCreate.forEach(step => {
            if (step.resourceId) {
                step.plannedStartDate = autoStartDate;
                step.assignedResourceId = step.resourceId;
                step.status = ProductionStepStatus.PLANNED;
                step.assignedUserId = defaultAssigneeId; 
            }
        });
            
        logger.info(`Taken voor order ${orderId} automatisch ingepland rond ${autoStartDate.toISOString()} voor gebruiker ${defaultAssigneeId}.`);
        
        stepsToCreate.unshift({ title: 'Start', order: 0, orderId: orderId, status: ProductionStepStatus.COMPLETED, plannedDurationHours: 0 });

        await tx.productionStep.createMany({ data: stepsToCreate });
        await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.PLANNED } });
        logger.info(`Order ${orderId} succesvol gepland met status ${OrderStatus.PLANNED}.`);

    } catch (error) {
        logger.error(`FATALE FOUT in planOrderWorkflow voor order ${orderId}: ${error.message}\n${error.stack}`);
        throw error;
    }
};

module.exports = {
    planOrderWorkflow,
};