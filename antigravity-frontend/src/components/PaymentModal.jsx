import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, X, CheckCircle, Loader2, QrCode, Copy, Shield, ArrowLeft } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, courseTitle, price, onComplete }) => {
    const [method, setMethod] = useState('upi'); // upi, qr, card
    const [step, setStep] = useState(1); // 1: select method, 2: enter details, 3: processing, 4: success
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [error, setError] = useState('');
    const [showQr, setShowQr] = useState(false);
    const [orderId] = useState(`ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`);

    // Generate UPI payment link
    const upiPaymentLink = `upi://pay?pa=antigravity@upi&pn=Hell%20Paradise%20LMS&am=${price}&tn=${encodeURIComponent(orderId)}&cu=INR`;

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setTimeout(() => {
                setStep(1);
                setMethod('upi');
                setUpiId('');
                setCardNumber('');
                setExpiry('');
                setCvv('');
                setCardName('');
                setError('');
                setShowQr(false);
            }, 300);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const validateUpi = () => {
        if (!upiId || !upiId.includes('@')) {
            setError('Please enter a valid UPI ID (e.g., user@okhdfcbank)');
            return false;
        }
        return true;
    };

    const validateCard = () => {
        if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
            setError('Please enter a valid 16-digit card number');
            return false;
        }
        if (!expiry || !expiry.includes('/')) {
            setError('Please enter expiry date (MM/YY)');
            return false;
        }
        if (!cvv || cvv.length < 3) {
            setError('Please enter a valid CVV');
            return false;
        }
        if (!cardName) {
            setError('Please enter the cardholder name');
            return false;
        }
        return true;
    };

    const handleProceed = () => {
        setError('');
        if (method === 'upi' && !validateUpi()) return;
        if (method === 'card' && !validateCard()) return;
        if (method === 'qr') {
            setShowQr(true);
            setStep(3);
            // Simulate QR scan and payment
            simulatePayment();
            return;
        }
        setStep(3);
        simulatePayment();
    };

    const simulatePayment = () => {
        // Simulate payment processing
        setTimeout(() => {
            setStep(4);
            setTimeout(() => {
                onComplete();
            }, 2000);
        }, 2500);
    };

    const copyUpiId = () => {
        navigator.clipboard.writeText('antigravity@upi');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md relative overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                    <div className="flex items-center justify-between">
                        {step > 1 && step < 4 ? (
                            <button onClick={() => setStep(1)} className="text-white/80 hover:text-white">
                                <ArrowLeft size={20} />
                            </button>
                        ) : (
                            <div />
                        )}
                        <h2 className="text-white font-bold text-lg">
                            {step === 1 && 'Choose Payment Method'}
                            {step === 2 && (method === 'upi' ? 'Enter UPI ID' : method === 'card' ? 'Card Details' : 'Scan QR Code')}
                            {step === 3 && 'Processing Payment'}
                            {step === 4 && 'Payment Successful'}
                        </h2>
                        <button onClick={onClose} className="text-white/80 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Select Payment Method */}
                    {step === 1 && (
                        <div className="space-y-4">
                            {/* Order Summary */}
                            <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
                                <p className="text-slate-400 text-sm mb-2">Course</p>
                                <p className="text-white font-medium mb-3 line-clamp-2">{courseTitle}</p>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                                    <span className="text-slate-400">Total</span>
                                    <span className="text-2xl font-bold text-emerald-400">₹{price}</span>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${method === 'upi' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                                <input type="radio" name="payment_method" value="upi" checked={method === 'upi'} onChange={() => setMethod('upi')} className="hidden" />
                                <Smartphone className={`mr-4 ${method === 'upi' ? 'text-indigo-400' : 'text-slate-500'}`} size={24} />
                                <div>
                                    <div className="font-bold text-slate-200">UPI Transfer</div>
                                    <div className="text-sm text-slate-400">Google Pay, PhonePe, Paytm, BHIM</div>
                                </div>
                            </label>

                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${method === 'qr' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                                <input type="radio" name="payment_method" value="qr" checked={method === 'qr'} onChange={() => setMethod('qr')} className="hidden" />
                                <QrCode className={`mr-4 ${method === 'qr' ? 'text-indigo-400' : 'text-slate-500'}`} size={24} />
                                <div>
                                    <div className="font-bold text-slate-200">Scan QR Code</div>
                                    <div className="text-sm text-slate-400">Scan with any UPI app</div>
                                </div>
                            </label>

                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${method === 'card' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                                <input type="radio" name="payment_method" value="card" checked={method === 'card'} onChange={() => setMethod('card')} className="hidden" />
                                <CreditCard className={`mr-4 ${method === 'card' ? 'text-indigo-400' : 'text-slate-500'}`} size={24} />
                                <div>
                                    <div className="font-bold text-slate-200">Credit / Debit Card</div>
                                    <div className="text-sm text-slate-400">Visa, MasterCard, RuPay, AMEX</div>
                                </div>
                            </label>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors text-lg mt-4"
                            >
                                Proceed to Pay ₹{price}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Enter Payment Details */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 text-sm">
                                    {error}
                                </div>
                            )}

                            {method === 'upi' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Your UPI ID</label>
                                        <input
                                            type="text"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                            placeholder="yourname@bankname"
                                            className="w-full bg-slate-800 border border-slate-700 px-4 py-3 text-white rounded-lg focus:outline-none focus:border-indigo-500"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">Enter your registered UPI ID (e.g., john@okhdfcbank)</p>
                                    </div>
                                </div>
                            )}

                            {method === 'card' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Card Number</label>
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            className="w-full bg-slate-800 border border-slate-700 px-4 py-3 text-white rounded-lg focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Cardholder Name</label>
                                        <input
                                            type="text"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full bg-slate-800 border border-slate-700 px-4 py-3 text-white rounded-lg focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm text-slate-400 mb-2">Expiry</label>
                                            <input
                                                type="text"
                                                value={expiry}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                                    setExpiry(val);
                                                }}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className="w-full bg-slate-800 border border-slate-700 px-4 py-3 text-white rounded-lg focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm text-slate-400 mb-2">CVV</label>
                                            <input
                                                type="text"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                placeholder="123"
                                                maxLength={4}
                                                className="w-full bg-slate-800 border border-slate-700 px-4 py-3 text-white rounded-lg focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleProceed}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors text-lg"
                            >
                                Pay ₹{price}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4">
                                <Shield size={14} />
                                <span>Your payment is secured with 256-bit SSL encryption</span>
                            </div>
                        </div>
                    )}

                    {/* Step 3: QR Code Display */}
                    {step === 2 && method === 'qr' && (
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl flex justify-center">
                                {/* Simulated QR Code */}
                                <div className="w-48 h-48 bg-slate-800 rounded-lg flex items-center justify-center relative">
                                    <QrCode size={120} className="text-indigo-400" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-indigo-600 rounded-lg animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-800 rounded-xl p-4 text-center">
                                <p className="text-slate-400 text-sm mb-2">Scan with any UPI app</p>
                                <p className="text-white font-medium">₹{price}</p>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                <Copy size={12} />
                                <button onClick={copyUpiId} className="hover:text-indigo-400">Copy UPI ID</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Processing */}
                    {step === 3 && (
                        <div className="py-12 text-center">
                            <Loader2 size={48} className="text-indigo-400 animate-spin mx-auto mb-4" />
                            <p className="text-white font-medium mb-2">Processing Payment...</p>
                            <p className="text-slate-400 text-sm">Please wait while we confirm your payment</p>
                            <div className="mt-6 bg-slate-800 rounded-lg p-3 inline-block">
                                <p className="text-xs text-slate-500">Order ID: {orderId}</p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="py-8 text-center">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={40} className="text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                            <p className="text-slate-400 mb-6">Your payment of ₹{price} has been processed</p>
                            <div className="bg-slate-800 rounded-xl p-4 text-left">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Order ID</span>
                                    <span className="text-white font-mono">{orderId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Amount Paid</span>
                                    <span className="text-emerald-400 font-bold">₹{price}</span>
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm mt-6">Redirecting to course...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
