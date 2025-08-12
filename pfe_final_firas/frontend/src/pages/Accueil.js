import React from 'react';
import { Link } from 'react-router-dom';

const Accueil = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Bienvenue sur</span>
              <span className="block text-blue-600">Notre Plateforme de Formation</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Découvrez nos formations et développez vos compétences professionnelles
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/connexion"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Se connecter
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/inscription"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      📚
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">
                      Formations Variées
                    </h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Accédez à une large gamme de formations dans différents domaines
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      🎓
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">
                      Apprentissage Flexible
                    </h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Apprenez à votre rythme avec nos contenus accessibles 24/7
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      🤝
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">
                      Communauté Active
                    </h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Échangez avec d'autres apprenants et des formateurs experts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment ça marche */}
          <div className="mt-24">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
                Comment ça marche ?
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Étape 1 */}
              <div className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      1
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">
                      Inscrivez-vous
                    </h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Créez votre compte en quelques clics et accédez à notre plateforme.
                    </p>
                  </div>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      2
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">
                      Choisissez vos formations
                    </h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Parcourez notre catalogue et inscrivez-vous aux formations qui vous intéressent.
                    </p>
                  </div>
                </div>
              </div>

              {/* Étape 3 */}
              <div className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      3
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">
                      Commencez à apprendre
                    </h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Suivez les cours à votre rythme et interagissez avec les formateurs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accueil;
