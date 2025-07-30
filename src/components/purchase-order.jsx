// controllers/purchase-order.controller.js

const { Prisma } = require('@prisma/client');
const prisma = require('../prisma/prisma');
const logger = require('../config/logger');

// Haalt alle inkooporders op die bij het bedrijf van de gebruiker horen
exports.getPurchaseOrders = async (req, res) => {
    const { companyId } = req.user;

    try {
        const purchaseOrders = await prisma.purchaseOrder.findMany({
            where: { companyId: companyId },
            // Voeg gerelateerde data toe die nuttig is voor de overzichtslijst
            include: {
                supplier: { select: { name: true } }, // Haal de naam van de leverancier op
                items: { select: { id: true } } // Tel het aantal regels
            },
            orderBy: {
                orderDate: 'desc'
            }
        });
        res.status(200).json(purchaseOrders);
    } catch (error) {
        logger.error(`Fout bij ophalen inkooporders voor bedrijf ${companyId}: ${error.message}`);
        res.status(500).json({ error: 'Kon inkooporders niet ophalen.' });
    }
};

// Maakt een nieuwe inkooporder met orderregels aan
exports.createPurchaseOrder = async (req, res) => {
    const { companyId } = req.user;
    // Verwacht de leverancier, optionele notities en een array van orderregels
    const { supplierId, notes, items } = req.body;

    // Validatie
    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Leverancier en minimaal één orderregel zijn verplicht.' });
    }

    try {
        // We gebruiken een transactie om te garanderen dat de inkooporder én alle
        // bijbehorende regels in één keer correct worden aangemaakt. Als één deel mislukt,
        // wordt de hele operatie teruggedraaid.
        const newPurchaseOrder = await prisma.$transaction(async (tx) => {
            // 1. Maak de hoof-inkooporder aan
            const po = await tx.purchaseOrder.create({
                data: {
                    companyId: companyId,
                    supplierId: supplierId,
                    notes: notes,
                    // Genereer een simpel, uniek inkoopnummer
                    poNumber: `PO-${Date.now()}` 
                }
            });

            // 2. Bereid de data voor de orderregels voor
            const itemData = items.map(item => ({
                purchaseOrderId: po.id,
                materialId: item.materialId,
                quantity: parseFloat(item.quantity),
                purchasePrice: parseFloat(item.purchasePrice)
            }));

            // 3. Maak alle orderregels in één keer aan
            await tx.purchaseOrderItem.createMany({
                data: itemData
            });

            return po;
        });

        logger.info(`Nieuwe inkooporder ${newPurchaseOrder.poNumber} aangemaakt voor bedrijf ${companyId}`);
        res.status(201).json(newPurchaseOrder);

    } catch (error) {
        logger.error(`Fout bij aanmaken van inkooporder voor bedrijf ${companyId}: ${error.message}`);
        res.status(500).json({ error: 'Kon nieuwe inkooporder niet aanmaken.' });
    }
};