import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Politique de Confidentialité</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <div>
            <p className="text-sm text-gray-600 mb-4">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            <p className="text-gray-700">
              La présente Politique de Confidentialité décrit comment Devora collecte, utilise, stocke et protège vos données personnelles 
              conformément au Règlement Général sur la Protection des Données (RGPD - UE 2016/679).
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Responsable du Traitement</h2>
            <p className="text-gray-700 mb-2">
              Le responsable du traitement de vos données personnelles est :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Nom :</strong> Devora</p>
              <p className="text-gray-700"><strong>Site web :</strong> <a href="https://devora.fun" className="text-emerald-600 hover:underline">https://devora.fun</a></p>
              <p className="text-gray-700"><strong>Email :</strong> contact@devora.fun</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Données Collectées</h2>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Données d'identification</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
              <li>Adresse email</li>
              <li>Nom complet (optionnel)</li>
              <li>Mot de passe (haché et sécurisé)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Données de facturation</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
              <li>Informations de paiement (traitées par Stripe, non stockées par Devora)</li>
              <li>Historique de facturation</li>
              <li>Statut d'abonnement</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">2.3 Données d'utilisation</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
              <li>Projets créés et leur contenu</li>
              <li>Conversations avec l'IA</li>
              <li>Tokens et clés API (OpenRouter, GitHub, Vercel) - chiffrés</li>
              <li>Dates de connexion et d'utilisation du service</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">2.4 Données techniques</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Adresse IP</li>
              <li>Type de navigateur et système d'exploitation</li>
              <li>Cookies (voir section Cookies)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Finalités du Traitement</h2>
            <p className="text-gray-700 mb-3">Vos données personnelles sont collectées et traitées pour les finalités suivantes :</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">a) Fourniture du service</h4>
                <p className="text-gray-700">Permettre la création, la gestion et le déploiement de vos projets.</p>
                <p className="text-sm text-gray-600">Base légale : Exécution du contrat</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">b) Gestion des abonnements</h4>
                <p className="text-gray-700">Traiter vos paiements, gérer votre abonnement et envoyer des factures.</p>
                <p className="text-sm text-gray-600">Base légale : Exécution du contrat et obligations légales</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">c) Communication</h4>
                <p className="text-gray-700">Vous envoyer des emails transactionnels (confirmation d'inscription, factures, rappels).</p>
                <p className="text-sm text-gray-600">Base légale : Exécution du contrat</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">d) Amélioration du service</h4>
                <p className="text-gray-700">Analyser l'utilisation du service pour améliorer ses fonctionnalités.</p>
                <p className="text-sm text-gray-600">Base légale : Intérêt légitime</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">e) Sécurité</h4>
                <p className="text-gray-700">Prévenir la fraude, les abus et garantir la sécurité du service.</p>
                <p className="text-sm text-gray-600">Base légale : Intérêt légitime et obligations légales</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Destinataires des Données</h2>
            <p className="text-gray-700 mb-3">Vos données personnelles peuvent être partagées avec les tiers suivants :</p>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1">Stripe</h4>
                <p className="text-gray-700 text-sm">Prestataire de paiement pour le traitement des abonnements.</p>
                <p className="text-xs text-gray-600 mt-1">Localisation : Union Européenne et États-Unis (Privacy Shield)</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1">Resend</h4>
                <p className="text-gray-700 text-sm">Service d'envoi d'emails transactionnels.</p>
                <p className="text-xs text-gray-600 mt-1">Localisation : Union Européenne</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1">OpenRouter / Fournisseurs d'IA</h4>
                <p className="text-gray-700 text-sm">Pour la génération de code via intelligence artificielle (uniquement le contenu des prompts).</p>
                <p className="text-xs text-gray-600 mt-1">Localisation : Variable selon le fournisseur</p>
              </div>
            </div>

            <p className="text-gray-700 mt-4">
              Nous ne vendons ni ne louons vos données personnelles à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Durée de Conservation</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Données de compte :</strong> Conservées tant que votre compte est actif + 3 ans après la fermeture du compte</li>
              <li><strong>Données de facturation :</strong> 10 ans (obligations comptables et fiscales)</li>
              <li><strong>Projets :</strong> Supprimés 30 jours après la fermeture de votre compte</li>
              <li><strong>Logs techniques :</strong> 12 mois maximum</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Vos Droits (RGPD)</h2>
            <p className="text-gray-700 mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">✅ Droit d'accès (Art. 15)</h4>
                <p className="text-gray-700 text-sm">Obtenir une copie de vos données personnelles.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">✏️ Droit de rectification (Art. 16)</h4>
                <p className="text-gray-700 text-sm">Corriger vos données inexactes ou incomplètes.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">🗑️ Droit à l'effacement (Art. 17)</h4>
                <p className="text-gray-700 text-sm">Demander la suppression de vos données (sous certaines conditions).</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">⏸️ Droit à la limitation (Art. 18)</h4>
                <p className="text-gray-700 text-sm">Limiter le traitement de vos données dans certaines situations.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">📦 Droit à la portabilité (Art. 20)</h4>
                <p className="text-gray-700 text-sm">Recevoir vos données dans un format structuré et lisible par machine.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">⛔ Droit d'opposition (Art. 21)</h4>
                <p className="text-gray-700 text-sm">Vous opposer au traitement de vos données pour des raisons légitimes.</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg mt-4">
              <p className="text-gray-700">
                <strong>Pour exercer vos droits :</strong> Connectez-vous à votre compte et accédez à la section "Paramètres" 
                ou contactez-nous via notre <button
                  onClick={() => navigate('/support')}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  page de support
                </button>.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Nous répondrons à votre demande dans un délai de 30 jours.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sécurité des Données</h2>
            <p className="text-gray-700 mb-3">Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Chiffrement des mots de passe (bcrypt)</li>
              <li>Authentification sécurisée (JWT)</li>
              <li>Accès restreint aux données (principe du moindre privilège)</li>
              <li>Surveillance et logs de sécurité</li>
              <li>Sauvegardes régulières</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
            <p className="text-gray-700 mb-3">Devora utilise des cookies pour :</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-3">
              <li><strong>Cookies essentiels :</strong> Authentification et fonctionnement du service (obligatoires)</li>
              <li><strong>Cookies de préférences :</strong> Mémoriser vos choix (langue, thème)</li>
              <li><strong>Cookies analytiques :</strong> Mesurer l'utilisation du service (avec votre consentement)</li>
            </ul>
            <p className="text-gray-700">
              Vous pouvez gérer vos préférences de cookies via la bannière affichée lors de votre première visite ou dans les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Transferts Internationaux</h2>
            <p className="text-gray-700 mb-3">
              Vos données peuvent être transférées et stockées en dehors de l'Union Européenne, notamment vers les États-Unis 
              (services Stripe, OpenRouter).
            </p>
            <p className="text-gray-700">
              Ces transferts sont encadrés par des garanties appropriées conformément au RGPD (clauses contractuelles types, 
              Privacy Shield, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications de la Politique</h2>
            <p className="text-gray-700">
              Nous pouvons modifier cette Politique de Confidentialité à tout moment. Les modifications sont effectives dès leur 
              publication. Nous vous notifierons par email en cas de changement important.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Réclamation auprès de la CNIL</h2>
            <p className="text-gray-700 mb-3">
              Si vous estimez que vos droits ne sont pas respectés, vous avez le droit de déposer une réclamation auprès de la 
              Commission Nationale de l'Informatique et des Libertés (CNIL) :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>CNIL</strong></p>
              <p className="text-gray-700">3 Place de Fontenoy</p>
              <p className="text-gray-700">TSA 80715</p>
              <p className="text-gray-700">75334 PARIS CEDEX 07</p>
              <p className="text-gray-700 mt-2">Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">www.cnil.fr</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact</h2>
            <p className="text-gray-700">
              Pour toute question concernant cette Politique de Confidentialité ou l'exercice de vos droits, contactez-nous :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p className="text-gray-700"><strong>Email :</strong> privacy@devora.fun</p>
              <p className="text-gray-700"><strong>Page de support :</strong>{' '}
                <button
                  onClick={() => navigate('/support')}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Contactez-nous
                </button>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
