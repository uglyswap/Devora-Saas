import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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
          <h1 className="text-xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <div>
            <p className="text-sm text-gray-600 mb-4">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            <p className="text-gray-700">
              Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'utilisation de la plateforme Devora (ci-après « le Service »), 
              accessible à l'adresse <a href="https://devora.fun" className="text-emerald-600 hover:underline">https://devora.fun</a>.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Objet</h2>
            <p className="text-gray-700 mb-3">
              Devora est une plateforme de génération de code assistée par intelligence artificielle permettant aux utilisateurs de créer, 
              modifier et déployer des applications web.
            </p>
            <p className="text-gray-700">
              L'acceptation des présentes CGU est indispensable pour accéder et utiliser le Service. En créant un compte, 
              vous acceptez sans réserve les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Inscription et Compte Utilisateur</h2>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Création de compte</h3>
            <p className="text-gray-700 mb-3">
              Pour utiliser Devora, vous devez créer un compte en fournissant une adresse email valide et un mot de passe sécurisé.
              Vous vous engagez à fournir des informations exactes et à les maintenir à jour.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Sécurité du compte</h3>
            <p className="text-gray-700 mb-3">
              Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité effectuée depuis votre compte 
              est présumée avoir été effectuée par vous.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">2.3 Âge minimum</h3>
            <p className="text-gray-700">
              Vous devez être âgé d'au moins 18 ans pour créer un compte et utiliser le Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Abonnement et Facturation</h2>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3.1 Période d'essai gratuite</h3>
            <p className="text-gray-700 mb-3">
              Devora offre une période d'essai gratuite de 7 jours lors de votre inscription. Aucun paiement n'est exigé pendant cette période.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">3.2 Abonnement payant</h3>
            <p className="text-gray-700 mb-3">
              Après la période d'essai, l'abonnement Devora Pro est facturé au tarif de 9,90 € TTC par mois. 
              Le paiement est effectué par carte bancaire via Stripe, notre prestataire de paiement sécurisé.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">3.3 Renouvellement automatique</h3>
            <p className="text-gray-700 mb-3">
              Votre abonnement est renouvelé automatiquement chaque mois jusqu'à résiliation. Vous pouvez annuler votre abonnement 
              à tout moment depuis votre espace de facturation.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">3.4 Échec de paiement</h3>
            <p className="text-gray-700 mb-3">
              En cas d'échec de paiement, Stripe tentera automatiquement de renouveler le paiement. Après 3 échecs consécutifs, 
              votre accès au Service sera suspendu jusqu'à régularisation.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">3.5 Résiliation</h3>
            <p className="text-gray-700">
              En cas de résiliation de votre abonnement, vous conservez l'accès au Service jusqu'à la fin de la période de facturation en cours.
              Aucun remboursement au prorata n'est effectué.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Utilisation du Service</h2>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Licence d'utilisation</h3>
            <p className="text-gray-700 mb-3">
              Devora vous accorde une licence personnelle, non exclusive et non transférable pour utiliser le Service 
              conformément aux présentes CGU.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Restrictions</h3>
            <p className="text-gray-700 mb-2">Vous vous engagez à ne pas :</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Utiliser le Service à des fins illégales ou non autorisées</li>
              <li>Tenter d'accéder à des parties non autorisées du Service</li>
              <li>Perturber ou interférer avec le fonctionnement du Service</li>
              <li>Copier, modifier ou distribuer le code source de Devora</li>
              <li>Utiliser des robots, scrapers ou autres moyens automatisés sans autorisation</li>
              <li>Revendre ou redistribuer l'accès au Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Propriété Intellectuelle</h2>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">5.1 Propriété de Devora</h3>
            <p className="text-gray-700 mb-3">
              Tous les droits de propriété intellectuelle relatifs au Service, y compris le code source, les algorithmes, 
              l'interface utilisateur et les marques, appartiennent à Devora.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">5.2 Contenu généré</h3>
            <p className="text-gray-700">
              Vous conservez tous les droits sur le code généré via le Service. Devora ne revendique aucun droit de propriété 
              sur vos projets et le code que vous créez.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Données Personnelles</h2>
            <p className="text-gray-700">
              Le traitement de vos données personnelles est régi par notre{' '}
              <button
                onClick={() => navigate('/legal/privacy')}
                className="text-emerald-600 hover:underline font-medium"
              >
                Politique de Confidentialité
              </button>
              , conforme au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disponibilité du Service</h2>
            <p className="text-gray-700 mb-3">
              Nous nous efforçons de maintenir le Service disponible 24h/24 et 7j/7. Toutefois, Devora ne garantit pas 
              une disponibilité ininterrompue et se réserve le droit d'effectuer des opérations de maintenance.
            </p>
            <p className="text-gray-700">
              Devora ne saurait être tenue responsable des interruptions de service, qu'elles soient planifiées ou non.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation de Responsabilité</h2>
            <p className="text-gray-700 mb-3">
              Le Service est fourni « en l'état ». Devora ne garantit pas que le code généré sera exempt d'erreurs, 
              de bugs ou adapté à un usage particulier.
            </p>
            <p className="text-gray-700">
              Dans les limites autorisées par la loi, Devora ne saurait être tenue responsable des dommages directs, 
              indirects, accessoires ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser le Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modification des CGU</h2>
            <p className="text-gray-700">
              Devora se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur 
              dès leur publication. Votre utilisation continue du Service après modification constitue votre acceptation des nouvelles CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Résiliation</h2>
            <p className="text-gray-700 mb-3">
              Vous pouvez résilier votre compte à tout moment depuis vos paramètres. Devora se réserve le droit de suspendre 
              ou résilier votre compte en cas de violation des présentes CGU.
            </p>
            <p className="text-gray-700">
              En cas de résiliation, vous perdez l'accès au Service et à vos données, sous réserve des obligations légales 
              de conservation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Droit Applicable et Juridiction</h2>
            <p className="text-gray-700">
              Les présentes CGU sont régies par le droit français. Tout litige relatif à l'interprétation ou à l'exécution 
              des présentes sera soumis aux tribunaux compétents de Paris, France.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact</h2>
            <p className="text-gray-700">
              Pour toute question concernant les présentes CGU, vous pouvez nous contacter via notre{' '}
              <button
                onClick={() => navigate('/support')}
                className="text-emerald-600 hover:underline font-medium"
              >
                page de support
              </button>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
