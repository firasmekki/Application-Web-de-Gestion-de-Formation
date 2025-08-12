import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loadUser } from './redux/slices/authSlice';

// Pages
import Accueil from './pages/Accueil';
import Connexion from './pages/auth/Connexion';
import Inscription from './pages/auth/Inscription';
import ReinitialisationMotDePasse from './pages/auth/ReinitialisationMotDePasse';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Tableaux de bord
import TableauDeBordParticipant from './pages/participant/TableauDeBord';
import TableauDeBordFormateur from './pages/formateur/TableauDeBord';
import TableauDeBordAdmin from './pages/admin/TableauDeBord';

// Pages participant
import ListeFormations from './pages/participant/ListeFormations';
import DetailFormation from './pages/participant/DetailFormation';
import ProfilParticipant from './pages/participant/Profil';
import HistoriqueFormations from './pages/participant/HistoriqueFormations';
import Chat from './pages/participant/Chat';
import Notifications from './pages/participant/Notifications';

// Pages formateur
import GestionFormations from './pages/formateur/GestionFormations';
import DetailsFormation from './pages/formateur/DetailFormation';
import ProfilFormateur from './pages/formateur/ProfilFormateur';
import StatistiquesFormateur from './pages/formateur/Statistiques';
import ChatFormateur from './pages/formateur/Chat';
import NotificationsFormateur from './pages/formateur/Notifications';
import CreationFormation from './pages/formateur/CreationFormation';

// Pages administrateur
import GestionUtilisateurs from './pages/admin/GestionUtilisateurs';
import GestionFormationsAdmin from './pages/admin/GestionFormations';
import GestionDomaines from './pages/admin/GestionDomaines';
import ValidationDemandes from './pages/admin/ValidationDemandes';
import StatistiquesAdmin from './pages/admin/Statistiques';
import Archive from './pages/admin/Archive';

function App() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  // Fonction pour rediriger vers le tableau de bord approprié
  const getTableauDeBordRoute = () => {
    if (!isAuthenticated || !user) return '/connexion';
    
    switch (user.role) {
      case 'participant':
        return '/participant/tableau-de-bord';
      case 'formateur':
        return '/formateur/tableau-de-bord';
      case 'administrateur':
        return '/admin/tableau-de-bord';
      default:
        return '/connexion';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        {/* Route racine avec redirection */}
        <Route
          path="/"
          element={<Navigate to={getTableauDeBordRoute()} replace />}
        />

        {/* Routes publiques */}
        <Route path="/connexion" element={
          isAuthenticated ? <Navigate to={getTableauDeBordRoute()} replace /> : <Connexion />
        } />
        <Route path="/inscription" element={
          isAuthenticated ? <Navigate to={getTableauDeBordRoute()} replace /> : <Inscription />
        } />
        <Route path="/reinitialisation-mot-de-passe" element={<ReinitialisationMotDePasse />} />
        <Route path="/reinitialisation-mot-de-passe/:token" element={<ReinitialisationMotDePasse />} />

        {/* Routes protégées pour les participants */}
        <Route
          path="/participant/*"
          element={
            <ProtectedRoute allowedRoles={['participant']}>
              <Layout>
                <Routes>
                  <Route path="tableau-de-bord" element={<TableauDeBordParticipant />} />
                  <Route path="formations" element={<ListeFormations />} />
                  <Route path="formations/:id" element={<DetailFormation />} />
                  <Route path="profil" element={<ProfilParticipant />} />
                  <Route path="historique" element={<HistoriqueFormations />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="notifications" element={<Notifications />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Routes protégées pour les formateurs */}
        <Route
          path="/formateur/*"
          element={
            <ProtectedRoute allowedRoles={['formateur']}>
              <Layout>
                <Routes>
                  <Route path="tableau-de-bord" element={<TableauDeBordFormateur />} />
                  <Route path="formations" element={<GestionFormations />} />
                  <Route path="formations/creation" element={<CreationFormation />} />
                  <Route path="formations/:id" element={<DetailsFormation />} />
                  <Route path="profil" element={<ProfilFormateur />} />
                  <Route path="statistiques" element={<StatistiquesFormateur />} />
                  <Route path="chat" element={<ChatFormateur />} />
                  <Route path="notifications" element={<NotificationsFormateur />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Routes protégées pour les administrateurs */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['administrateur']}>
              <Layout>
                <Routes>
                  <Route path="tableau-de-bord" element={<TableauDeBordAdmin />} />
                  <Route path="utilisateurs" element={<GestionUtilisateurs />} />
                  <Route path="formations" element={<GestionFormationsAdmin />} />
                  <Route path="domaines" element={<GestionDomaines />} />
                  <Route path="validation-demandes" element={<ValidationDemandes />} />
                  <Route path="statistiques" element={<StatistiquesAdmin />} />
                  <Route path="archive" element={<Archive />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Route 404 */}
        <Route path="*" element={<Navigate to={getTableauDeBordRoute()} replace />} />
      </Routes>
    </div>
  );
}

export default App;
