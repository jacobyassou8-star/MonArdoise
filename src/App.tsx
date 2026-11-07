/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { AccountsList } from './components/AccountsList';
import { AccountDetailModal } from './components/AccountDetailModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { NewContactModal } from './components/NewContactModal';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { CancelTransactionModal } from './components/CancelTransactionModal';
import { SalesStockView } from './components/SalesStockView';
import { BoutiquesTeamView } from './components/BoutiquesTeamView';
import { AuditTrailView } from './components/AuditTrailModal';
import { LaunchPricingModal } from './components/LaunchPricingModal';
import { MerchantPaymentsModal } from './components/MerchantPaymentsModal';
import { KycAdminModal } from './components/KycAdminModal';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { ExportDataModal } from './components/ExportDataModal';
import { ResetDataModal } from './components/ResetDataModal';
import { FeaturesHubBar } from './components/FeaturesHubBar';
import { Contact, Transaction } from './types';
import { InscriptionModal } from './components/inscriptionmodal';
  Smartphone, 
  Monitor, 
  Wifi, 
  Battery, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

function AppContent() {
  const { 
    deviceMode, 
    setDeviceMode, 
    deviceType, 
    setDeviceType, 
    transactions, 
    toast 
  } = useApp();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'accounts' | 'stock' | 'boutiques' | 'audit'>('accounts');

  // Modal states
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showNewContact, setShowNewContact] = useState<boolean>(false);
  const [showNewTx, setShowNewTx] = useState<boolean>(false);
  const [prefilledContactForTx, setPrefilledContactForTx] = useState<Contact | null>(null);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [cancelTargetTx, setCancelTargetTx] = useState<Transaction | null>(null);
  const [showPricing, setShowPricing] = useState<boolean>(false);
  const [showPayments, setShowPayments] = useState<boolean>(false);
  const [showKyc, setShowKyc] = useState<boolean>(false);
  const [showExport, setShowExport] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
 const [showInscription, setShowInscription] = useState<boolean>(false); 
  // Handlers
  const handleOpenNewTx = (contact?: Contact) => {
    setPrefilledContactForTx(contact || null);
    setShowNewTx(true);
  
  };

  const handleTxSuccess = (txId: string) => {
    setShowNewTx(false);
    setPrefilledContactForTx(null);
    const found = transactions.find((t) => t.id === txId);
    if (found) {
      setReceiptTx(found);
    }
  };

  const handleSelectReceiptById = (txId: string) => {
    const found = transactions.find((t) => t.id === txId);
    if (found) {
      setReceiptTx(found);
    }
    
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-200">
          <div className={`px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold border ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : toast.type === 'info'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-700'
              : 'bg-emerald-600 text-white border-emerald-500'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Floating Viewport Mode Selector (Only on desktop screens) */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2 bg-slate-900 text-white text-xs border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-white">MonArdoise</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-300">Application mobile pour commerçants (Android & iPhone)</span>
          <button
            onClick={() => setShowPricing(true)}
            className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-500/30 transition-colors"
          >
            <Tag className="w-3 h-3" />
            <span>Offre Lancement -20% active</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setDeviceMode('frame')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                deviceMode === 'frame' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Aperçu Mobile</span>
            </button>
            <button
              onClick={() => setDeviceMode('responsive')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                deviceMode === 'responsive' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Plein Écran Web</span>
            </button>
          </div>

          {deviceMode === 'frame' && (
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-[11px]">
              <button
                onClick={() => setDeviceType('iphone')}
                className={`px-2 py-0.5 rounded ${deviceType === 'iphone' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                iPhone
              </button>
              <button
                onClick={() => setDeviceType('android')}
                className={`px-2 py-0.5 rounded ${deviceType === 'android' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                Android
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container rendering either device frame OR responsive layout */}
      {deviceMode === 'frame' ? (
        <div className="py-6 sm:py-8 px-2 flex items-center justify-center min-h-[calc(100vh-42px)]">
          {/* Mobile Smartphone Frame */}
          <div className={`w-full max-w-[412px] h-[860px] max-h-[94vh] bg-white dark:bg-slate-900 rounded-[44px] shadow-2xl border-[9px] ${
            deviceType === 'iphone' ? 'border-slate-800' : 'border-slate-850'
          } flex flex-col overflow-hidden relative ring-1 ring-black/10`}>
            
            {/* Native Mobile Status Bar */}
            <div className="h-8 bg-white dark:bg-slate-900 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-200 shrink-0 z-50 select-none">
              <span>09:20</span>
              
              {/* Dynamic Island / Camera hole */}
              {deviceType === 'iphone' ? (
                <div className="w-24 h-4 bg-black rounded-full" />
              ) : (
                <div className="w-3.5 h-3.5 bg-black rounded-full" />
              )}

              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">5G</span>
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Mobile Top Bar */}
            <TopBar
              currentTab={currentTab}
              onTabChange={(tab) => setCurrentTab(tab as any)}
              onOpenNewTx={() => handleOpenNewTx()}
              onOpenPricing={() => setShowPricing(true)}
              onOpenPayments={() => setShowPayments(true)}
              onOpenExport={() => setShowExport(true)}
              onOpenReset={() => setShowResetModal(true)}
            />

            {/* Scrollable Mobile App Body */}
            <main className="flex-1 overflow-y-auto px-3.5 py-4">
              {/* Feature Hub Bar */}
              <FeaturesHubBar
                onOpenNewTx={() => handleOpenNewTx()}
                onOpenNewContact={() => setShowNewContact(true)}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenPayments={() => setShowPayments(true)}
                onOpenExport={() => setShowExport(true)}
                onOpenPricing={() => setShowPricing(true)}
                onOpenKyc={() => setShowKyc(true)}
                onOpenReset={() => setShowResetModal(true)}
              />

              {currentTab === 'accounts' && (
                <AccountsList
                  onSelectContact={(c) => setSelectedContact(c)}
                  onOpenNewContact={() => setShowNewContact(true)}
                  onQuickTx={(c) => handleOpenNewTx(c)}
                />
              )}

              {currentTab === 'stock' && (
                <SalesStockView
                  onOpenNewTx={() => handleOpenNewTx()}
                  onSelectReceipt={handleSelectReceiptById}
                />
              )}

              {currentTab === 'boutiques' && <BoutiquesTeamView />}

              {currentTab === 'audit' && (
                <AuditTrailView
                  onViewReceipt={(tx) => setReceiptTx(tx)}
                />
              )}
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav
              currentTab={currentTab}
              onTabChange={(tab) => setCurrentTab(tab as any)}
              onOpenNewTx={() => handleOpenNewTx()}
              onOpenMore={() => setShowMobileMenu(true)}
            />

            {/* Home indicator bar for iPhone */}
            {deviceType === 'iphone' && (
              <div className="h-4 bg-white/95 dark:bg-slate-900/95 flex items-center justify-center shrink-0">
                <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <InscriptionModal 
  isOpen={showInscription} 
  onClose={() => setShowInscription(false)} 
/>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full-Width Responsive View for Tablet & Desktop */
        <div className="min-h-screen flex flex-col">
          <TopBar
            currentTab={currentTab}
            onTabChange={(tab) => setCurrentTab(tab as any)}
            onOpenNewTx={() => handleOpenNewTx()}
            onOpenPricing={() => setShowPricing(true)}
            onOpenPayments={() => setShowPayments(true)}
            onOpenExport={() => setShowExport(true)}
            onOpenReset={() => setShowResetModal(true)}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Feature Hub Bar */}
            <FeaturesHubBar
              onOpenNewTx={() => handleOpenNewTx()}
              onOpenNewContact={() => setShowNewContact(true)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenPayments={() => setShowPayments(true)}
              onOpenExport={() => setShowExport(true)}
              onOpenPricing={() => setShowPricing(true)}
              onOpenKyc={() => setShowKyc(true)}
              onOpenReset={() => setShowResetModal(true)}
            />

            {currentTab === 'accounts' && (
              <AccountsList
                onSelectContact={(c) => setSelectedContact(c)}
                onOpenNewContact={() => setShowNewContact(true)}
                onQuickTx={(c) => handleOpenNewTx(c)}
              />
            )}

            {currentTab === 'stock' && (
              <SalesStockView
                onOpenNewTx={() => handleOpenNewTx()}
                onSelectReceipt={handleSelectReceiptById}
              />
            )}

            {currentTab === 'boutiques' && <BoutiquesTeamView />}

            {currentTab === 'audit' && (
              <AuditTrailView
                onViewReceipt={(tx) => setReceiptTx(tx)}
              />
            )}
          </main>

          {/* Bottom Nav for mobile screens */}
          <BottomNav
            currentTab={currentTab}
            onTabChange={(tab) => setCurrentTab(tab as any)}
            onOpenNewTx={() => handleOpenNewTx()}
            onOpenMore={() => setShowMobileMenu(true)}
          />
        </div>
      )}

      {/* Modals */}
      {selectedContact && (
        <AccountDetailModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onNewTx={(c) => {
            setSelectedContact(null);
            handleOpenNewTx(c);
          }}
          onViewReceipt={(tx) => setReceiptTx(tx)}
          onRequestCancel={(tx) => setCancelTargetTx(tx)}
        />
      )}

      {showNewContact && (
        <NewContactModal
          onClose={() => setShowNewContact(false)}
          onSuccess={(newId) => {
            setShowNewContact(false);
          }}
        />
      )}

      {showNewTx && (
        <NewTransactionModal
          initialContact={prefilledContactForTx}
          onClose={() => {
            setShowNewTx(false);
            setPrefilledContactForTx(null);
          }}
          onSuccess={handleTxSuccess}
          onOpenNewContact={() => {
            setShowNewContact(true);
          }}
        />
      )}

      {receiptTx && (
        <TransactionReceiptModal
          transaction={receiptTx}
          onClose={() => setReceiptTx(null)}
        />
      )}

      {cancelTargetTx && (
        <CancelTransactionModal
          transaction={cancelTargetTx}
          onClose={() => setCancelTargetTx(null)}
          onSuccess={() => {
            setCancelTargetTx(null);
          }}
        />
      )}

      {showPricing && (
        <LaunchPricingModal onClose={() => setShowPricing(false)} />
      )}

      {showPayments && (
        <MerchantPaymentsModal onClose={() => setShowPayments(false)} />
      )}

      {showKyc && (
        <KycAdminModal onClose={() => setShowKyc(false)} />
      )}

      {showExport && (
        <ExportDataModal onClose={() => setShowExport(false)} />
      )}

      {showResetModal && (
        <ResetDataModal onClose={() => setShowResetModal(false)} />
      )}

      {showMobileMenu && (
        <MobileMenuDrawer
          onClose={() => setShowMobileMenu(false)}
          onOpenPricing={() => setShowPricing(true)}
          onOpenPayments={() => setShowPayments(true)}
          onOpenKyc={() => setShowKyc(true)}
          onOpenExport={() => setShowExport(true)}
          onOpenReset={() => setShowResetModal(true)}
          onOpenAudit={() => {
            setShowMobileMenu(false);
            setCurrentTab('audit');
          
 
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
