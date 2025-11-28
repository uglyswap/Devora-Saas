import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mail, MessageCircle, HelpCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Support = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      question: "Comment fonctionne la période d'essai gratuite ?",
      answer: "Lors de votre inscription, vous bénéficiez automatiquement de 7 jours d'essai gratuit. Aucune carte bancaire n'est requise pendant cette période. Vous pouvez explorer toutes les fonctionnalités de Devora sans engagement."
    },
    {
      question: "Comment puis-je annuler mon abonnement ?",
      answer: "Vous pouvez annuler votre abonnement à tout moment depuis votre page de facturation. Cliquez sur 'Gérer mon abonnement' pour accéder au portail Stripe. Vous conserverez l'accès jusqu'à la fin de votre période de facturation en cours."
    },
    {
      question: "Quels modes de paiement acceptez-vous ?",
      answer: "Nous acceptons toutes les cartes bancaires majeures (Visa, Mastercard, American Express) via notre prestataire de paiement sécurisé Stripe."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Oui, la sécurité est notre priorité. Nous utilisons le chiffrement HTTPS/TLS pour toutes les communications, les mots de passe sont hachés avec bcrypt, et nous sommes conformes au RGPD. Vos données de paiement sont traitées directement par Stripe et ne transitent jamais par nos serveurs."
    },
    {
      question: "Puis-je exporter mes projets ?",
      answer: "Oui ! Devora vous permet d'exporter vos projets vers GitHub et de les déployer directement sur Vercel. Vous conservez la pleine propriété de tout le code généré."
    },
    {
      question: "Combien de projets puis-je créer ?",
      answer: "Avec l'abonnement Devora Pro, vous pouvez créer un nombre illimité de projets. Il n'y a aucune restriction sur le nombre de fichiers ou la taille de vos projets."
    },
    {
      question: "Quelles technologies sont supportées ?",
      answer: "Devora génère du code HTML, CSS et JavaScript moderne. Le système agentique peut créer des applications web complètes avec React, Vue, ou du JavaScript vanilla."
    },
    {
      question: "Que se passe-t-il si mon paiement échoue ?",
      answer: "En cas d'échec de paiement, nous vous envoyons un email de notification. Stripe tentera automatiquement de renouveler le paiement plusieurs fois. Après 3 échecs consécutifs, votre accès sera suspendu jusqu'à régularisation."
    },
    {
      question: "Puis-je obtenir un remboursement ?",
      answer: "Les abonnements sont facturés mensuellement et ne sont pas remboursables. Toutefois, vous pouvez annuler à tout moment et vous conserverez l'accès jusqu'à la fin de la période payée."
    },
    {
      question: "Comment exercer mes droits RGPD ?",
      answer: "Vous pouvez accéder, modifier ou supprimer vos données personnelles depuis vos paramètres de compte. Pour toute demande spécifique (portabilité, opposition), contactez-nous via ce formulaire."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSending(true);
    
    try {
      // Simuler l'envoi (à implémenter avec backend)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Message envoyé ! Nous vous répondrons sous 24h.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b]">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Support & FAQ</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-8 h-8 text-emerald-400" />
              <h2 className="text-3xl font-bold text-white">Questions Fréquentes</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-all hover:bg-white/10"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between"
                  >
                    <span className="font-semibold text-white pr-4">{faq.question}</span>
                    <CheckCircle
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${
                        expandedFaq === index ? 'rotate-90 text-emerald-400' : 'text-gray-400'
                      }`}
                    />
                  </button>
                  
                  {expandedFaq === index && (
                    <div className="px-6 pb-4 text-gray-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-8 h-8 text-blue-400" />
              <h2 className="text-3xl font-bold text-white">Contactez-nous</h2>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
              <p className="text-gray-300 mb-6">
                Vous n'avez pas trouvé la réponse à votre question ? Notre équipe est là pour vous aider !
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="jean.dupont@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Problème technique, facturation, etc."
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Décrivez votre question ou problème en détail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Envoyer le message
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-400 text-center">
                  Nous répondons généralement sous 24 heures
                </p>
              </form>
            </div>

            {/* Contact Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-blue-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Email direct</h3>
                  <p className="text-gray-300">support@devora.fun</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Pour les questions urgentes ou complexes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Ressources Utiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/legal/terms')}
              className="text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <h4 className="font-semibold text-white mb-1">Conditions d'utilisation</h4>
              <p className="text-sm text-gray-400">CGU et règles d'utilisation</p>
            </button>
            
            <button
              onClick={() => navigate('/legal/privacy')}
              className="text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <h4 className="font-semibold text-white mb-1">Politique de confidentialité</h4>
              <p className="text-sm text-gray-400">Protection de vos données (RGPD)</p>
            </button>
            
            <button
              onClick={() => navigate('/billing')}
              className="text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <h4 className="font-semibold text-white mb-1">Facturation</h4>
              <p className="text-sm text-gray-400">Gérer votre abonnement</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;
