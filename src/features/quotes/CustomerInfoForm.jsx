import React from 'react';

const CustomerInfoForm = ({ customerInfo = {}, setCustomerInfo, deliveryTime, setDeliveryTime, marginPercentage, setMarginPercentage }) => {
    
    const handleCustomerChange = (e) => {
        setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Klant- en Verzendgegevens</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="form-control">
                    <label className="label py-1"><span className="label-text">Naam contactpersoon</span></label>
                    <input className="input input-bordered w-full" type="text" name="name" placeholder="Naam contactpersoon" value={customerInfo.name || ''} onChange={handleCustomerChange}/>
                </div>
                <div className="form-control">
                    <label className="label py-1"><span className="label-text">E-mailadres klant</span></label>
                    <input className="input input-bordered w-full" type="email" name="email" placeholder="E-mailadres klant" value={customerInfo.email || ''} onChange={handleCustomerChange}/>
                </div>
                <div className="form-control">
                    <label className="label py-1"><span className="label-text">Bedrijfsnaam klant</span></label>
                    <input className="input input-bordered w-full" type="text" name="company" placeholder="Bedrijfsnaam klant" value={customerInfo.company || ''} onChange={handleCustomerChange}/>
                </div>
                <div className="form-control">
                    <label className="label py-1"><span className="label-text">Uiterste Leverdatum</span></label>
                    <input className="input input-bordered w-full" type="date" value={deliveryTime || ''} onChange={(e) => setDeliveryTime(e.target.value)} />
                </div>
                <div className="form-control md:col-span-2">
                    <label className="label py-1"><span className="label-text">Straat en huisnummer</span></label>
                    <input className="input input-bordered w-full" type="text" name="address" placeholder="Straat en huisnummer" value={customerInfo.address || ''} onChange={handleCustomerChange}/>
                </div>
                <div className="form-control">
                    <label className="label py-1"><span className="label-text">Postcode</span></label>
                    <input className="input input-bordered w-full" type="text" name="postal_code" placeholder="Postcode" value={customerInfo.postal_code || ''} onChange={handleCustomerChange}/>
                </div>
                <div className="form-control">
                    <label className="label py-1"><span className="label-text">Stad</span></label>
                    <input className="input input-bordered w-full" type="text" name="city" placeholder="Stad" value={customerInfo.city || ''} onChange={handleCustomerChange}/>
                </div>
                 <div className="form-control">
                    <label className="label py-1"><span className="label-text">Land (bv. NL)</span></label>
                    <input className="input input-bordered w-full" type="text" name="country" placeholder="Land (bv. NL)" value={customerInfo.country || ''} onChange={handleCustomerChange}/>
                </div>
                <div className="form-control">
                     <label className="label py-1">
                        <span className="label-text">Marge (%)</span>
                        <span className="label-text-alt text-gray-500">Leeg = standaard</span>
                    </label>
                    <input 
                        className="input input-bordered w-full" 
                        type="number" 
                        min="0" 
                        step="0.1" 
                        placeholder="Standaard (30%)" 
                        value={marginPercentage || ''} 
                        onChange={(e)=>{ setMarginPercentage(e.target.value); }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomerInfoForm;