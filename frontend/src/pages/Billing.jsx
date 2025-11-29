import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { CreditCard, Calendar, Download, Check, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Billing() {
  const navigate = useNavigate();
  const { user, hasActiveSubscription, isTrialing, getTrialDaysLeft, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/billing/invoices`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/billing/create-checkout-session`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la création de la session de paiement');
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/billing/create-portal-session`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Erreur lors de l\'accès au portail de gestion');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const trialDaysLeft = getTrialDaysLeft();
  const showTrialBanner = isTrialing() && trialDaysLeft > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b]">
      {/* Navigation */}
      <Navigation />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-white">Facturation</h1>
        {/* Trial Banner */}
        {showTrialBanner && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-emerald-400 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Période d'essai gratuite - {trialDaysLeft} jour{trialDaysLeft > 1 ? 's' : ''} restant{trialDaysLeft > 1 ? 's' : ''}
                </h3>
                <p className="text-gray-400 mb-4">
                  Profitez de toutes les fonctionnalités de Devora gratuitement jusqu'au {formatDate(user?.current_period_end)}
                </p>
                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  S'abonner maintenant
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Abonnement actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasActiveSubscription() ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">Devora Pro</p>
                    <p className="text-gray-400">9,90€ TTC / mois</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    user?.subscription_status === 'active' 
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user?.subscription_status === 'active' ? 'Actif' : 'Essai gratuit'}
                  </div>
                </div>

                {user?.current_period_end && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {user?.subscription_status === 'active' 
                      ? `Prochain renouvellement : ${formatDate(user.current_period_end)}`
                      : `Fin de l'essai : ${formatDate(user.current_period_end)}`
                    }
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <h4 className="font-semibold mb-3">Inclus dans votre abonnement :</h4>
                  <ul className="space-y-2">
                    {[
                      'Système agentique illimité',
                      'Génération de code sans restriction',
                      'Projets illimités',
                      'Export GitHub & Vercel',
                      'Support prioritaire'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-300">
                        <Check className="w-4 h-4 text-emerald-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-white/10 text-white hover:bg-white/5"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                  Gérer mon abonnement
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-6">Vous n'avez pas d'abonnement actif</p>
                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  S'abonner à Devora Pro - 9,90€/mois
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              Factures
            </CardTitle>
            <CardDescription>Téléchargez vos factures</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInvoices ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
              </div>
            ) : invoices.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucune facture disponible</p>
            ) : (
              <div className="space-y-2">
                {invoices.map((invoice, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {new Date(invoice.created * 1000).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </p>
                      <p className="text-sm text-gray-400">
                        {invoice.amount.toFixed(2)}€ {invoice.currency.toUpperCase()} - {invoice.status}
                      </p>
                    </div>
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
