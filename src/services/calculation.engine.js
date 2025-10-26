// services/calculation.engine.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock voor de uitslag-service
const runImpositionService = async (inputs) => {
    return {
        sheets: Math.ceil(inputs.quantity / 6),
        perSheet: 6,
        waste: 10,
        across: 3,
        down: 2,
        layout: { /* ... visuele data ... */ }
    };
};

// De kernlogica die nu een zeer gedetailleerd en compleet rapport teruggeeft
const calculateFromProductTemplate = async (input) => {
    // === NIEUW: Diagnostisch Rapport Systeem ===
    const debugReport = [];

    try {
        debugReport.push({
            stage: 'Initiatie',
            message: 'Berekening gestart.',
            timestamp: new Date().toISOString(),
            input: input,
        });

        const { template, quantity, overrides, marginPercentage: marginOverride } = input;
        
        const wf = template.workflowDefinition;
        if (!wf || !wf.nodes || wf.nodes.length === 0) {
            throw new Error("Product Template heeft geen geldige workflow definitie.");
        }
        
        const { nodes, edges } = wf;
        debugReport.push({ stage: 'Workflow Geladen', message: `Workflow gevonden met ${nodes.length} stappen.`, nodes });

        const items = [];
        let totalCost = 0;
        let totalTimeHours = 0;

        // --- STAP 1: Materiaal & Uitslag ---
        const materialId = overrides?.materialId || template.defaultMaterialId;
        debugReport.push({ stage: 'Materiaal Zoeken', message: `Zoeken naar materiaal met ID: ${materialId}` });
        const material = await prisma.material.findUnique({ where: { id: materialId } });
        if (!material) throw new Error(`Materiaal niet gevonden met ID: ${materialId}`);
        debugReport.push({ stage: 'Materiaal Gevonden', data: material });

        const imposition = await runImpositionService({ ...template, ...overrides, quantity });
        imposition.material = material;
        const materialCost = imposition.sheets * parseFloat(material.price);
        
        items.push({
            type: 'MATERIAL',
            description: material.name,
            spec: `${imposition.sheets} vellen à ${parseFloat(material.price).toFixed(2)}`,
            total: materialCost
        });
        totalCost += materialCost;
        debugReport.push({ stage: 'Materiaalkosten Berekend', message: `Kosten: ${materialCost.toFixed(2)}`, imposition: imposition });

        // --- STAP 2: Doorloop de workflow ---
        const nodeMap = new Map(nodes.map(node => [node.id, node]));
        let currentNode = nodes.find(n => n.data.type === 'Start');
        let stepCounter = 0;

        while (currentNode && currentNode.data.type !== 'Einde' && stepCounter < nodes.length) {
            stepCounter++;
            const edge = edges.find(e => e.source === currentNode.id);
            if (!edge) {
                debugReport.push({ stage: 'Workflow Stap Einde', message: `Geen uitgaande verbinding gevonden voor node ${currentNode.id}. Stoppen.` });
                break;
            }
            currentNode = nodeMap.get(edge.target);
            if (!currentNode) {
                debugReport.push({ stage: 'Workflow Stap Fout', message: `Doel-node ${edge.target} niet gevonden. Stoppen.` });
                break;
            }

            const { resourceId, type, label } = currentNode.data;
            const stageName = `Workflow Stap ${stepCounter}: ${label}`;
            debugReport.push({ stage: stageName, message: `Verwerken van node type '${type}'...` });
            
            if (['Machine', 'Finishing', 'Labor'].includes(type)) {
                if (!resourceId) {
                    debugReport.push({ stage: stageName, status: 'WAARSCHUWING', message: 'Node heeft geen resourceId, wordt overgeslagen.' });
                    continue;
                }
                
                let resource, cost = 0, time = 0, spec = '';
                debugReport.push({ stage: stageName, message: `Zoeken naar resource met ID: ${resourceId}` });

                if (type === 'Machine') resource = await prisma.machine.findUnique({ where: { id: resourceId } });
                if (type === 'Finishing') resource = await prisma.finishingEquipment.findUnique({ where: { id: resourceId } });
                if (type === 'Labor') resource = await prisma.laborRate.findUnique({ where: { id: resourceId } });

                debugReport.push({ stage: stageName, message: 'Database resultaat voor resource:', data: resource });

                if (resource) {
                    const profile = resource.costingProfile || {};
                    const costPerHour = parseFloat(profile.costPerHour || resource.costPerHour || 0);
                    const setupMinutes = parseFloat(profile.setupMinutes || resource.setupMinutes || 0);
                    const speed = (profile.speeds?.Standaard?.value) || 1;
                    
                    const runHours = (quantity / speed) || 0;
                    const setupHours = setupMinutes / 60;
                    
                    time = runHours + setupHours;
                    cost = time * costPerHour;
                    spec = `${time.toFixed(2)} uur à ${costPerHour.toFixed(2)}/u`;

                    debugReport.push({ stage: stageName, message: 'Kostenberekening voor stap:', details: { costPerHour, setupMinutes, speed, time, cost } });
                    
                    items.push({ type: type.toUpperCase(), description: label, spec: spec, total: cost });
                    totalCost += cost;
                    totalTimeHours += time;
                } else {
                    debugReport.push({ stage: stageName, status: 'FOUT', message: 'Resource niet gevonden in database!' });
                }
            }
        }

        // --- STAP 3: Business Logic ---
        const directCost = totalCost;
        const overheadPercentage = 0.12;
        const marginPercentage = typeof marginOverride !== 'undefined' ? marginOverride / 100 : 0.20;
        const vatPercentage = 0.21;
        const overhead = directCost * overheadPercentage;
        const costPrice = directCost + overhead;
        const marginAmount = costPrice * marginPercentage;
        const subTotal = costPrice + marginAmount;
        const vatAmount = subTotal * vatPercentage;
        const grandTotal = subTotal + vatAmount;
        debugReport.push({ stage: 'Prijsopbouw', data: { directCost, overhead, costPrice, marginAmount, subTotal, vatAmount, grandTotal } });

        // --- STAP 4: Formatteer Output ---
        return {
            lines: [{
                items: items,
                prices: { main: { costTotals: { direct: directCost, overhead: overhead, costPrice: costPrice }, margin: { percentage: marginPercentage * 100, amount: marginAmount }, vat: { rate: vatPercentage * 100 } } },
                timeTotals: { total: totalTimeHours },
                impositions: [imposition],
                resolved: { material: material, dimensions: { ...overrides } },
            }],
            grandTotals: { total: grandTotal, subTotal: subTotal, vat: vatAmount, costPrice: costPrice },
            debugReport: debugReport, // Voeg het rapport toe aan de response
        };

    } catch (error) {
        debugReport.push({ stage: 'FATALE FOUT', status: 'CRASH', message: error.message, stack: error.stack });
        // Geef altijd een response terug, zelfs bij een fout, met het debug rapport
        return { error: true, errorMessage: error.message, debugReport: debugReport };
    }
};

module.exports = {
    calculateFromProductTemplate
};