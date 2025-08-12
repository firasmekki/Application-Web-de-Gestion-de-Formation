// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { obtenirStatistiquesAdmin } from '../../redux/slices/adminSlice';

// // Import icons from a different source (you might want to use heroicons or another icon library)
// import { 
//   AcademicCapIcon, 
//   UserGroupIcon, 
//   UserIcon, 
//   ClipboardListIcon 
// } from '@heroicons/react/outline';

// const TableauBord = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const { statistiques } = useSelector((state) => state.admin);

//   useEffect(() => {
//     const chargerDonnees = async () => {
//       try {
//         await dispatch(obtenirStatistiquesAdmin()).unwrap();
//       } catch (err) {
//         setError('Erreur lors du chargement des statistiques');
//       } finally {
//         setLoading(false);
//       }
//     };

//     chargerDonnees();
//   }, [dispatch]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[80vh]">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-7xl">
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
//           <span className="block sm:inline">{error}</span>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         {/* Statistiques Formations */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex flex-col items-start">
//             <AcademicCapIcon className="h-10 w-10 text-blue-500 mb-4" />
//             <h3 className="text-lg font-semibold text-gray-900">Formations</h3>
//             <p className="text-3xl font-bold text-blue-500 mt-2">{statistiques.totalFormations}</p>
//             <p className="text-sm text-gray-500 mt-1">{statistiques.formationsEnCours} en cours</p>
//           </div>
//         </div>

//         {/* Statistiques Formateurs */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex flex-col items-start">
//             <UserIcon className="h-10 w-10 text-purple-500 mb-4" />
//             <h3 className="text-lg font-semibold text-gray-900">Formateurs</h3>
//             <p className="text-3xl font-bold text-purple-500 mt-2">{statistiques.totalFormateurs}</p>
//             <p className="text-sm text-gray-500 mt-1">{statistiques.formateursActifs} actifs</p>
//           </div>
//         </div>

//         {/* Statistiques Participants */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex flex-col items-start">
//             <UserGroupIcon className="h-10 w-10 text-green-500 mb-4" />
//             <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
//             <p className="text-3xl font-bold text-green-500 mt-2">{statistiques.totalParticipants}</p>
//             <p className="text-sm text-gray-500 mt-1">{statistiques.participantsActifs} actifs</p>
//           </div>
//         </div>

//         {/* Formations en attente */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex flex-col items-start">
//             <ClipboardListIcon className="h-10 w-10 text-orange-500 mb-4" />
//             <h3 className="text-lg font-semibold text-gray-900">Formations en attente</h3>
//             <p className="text-3xl font-bold text-orange-500 mt-2">{statistiques.formationsEnAttente}</p>
//           </div>
//         </div>

//         {/* Formations récentes */}
//         <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow">
//           <div className="p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Formations récentes</h3>
//             <ul className="divide-y divide-gray-200">
//               {statistiques.formationsRecentes?.map((formation) => (
//                 <li key={formation._id} className="py-3">
//                   <button
//                     onClick={() => navigate(`/admin/formations/${formation._id}`)}
//                     className="w-full text-left hover:bg-gray-50 p-2 rounded transition-colors duration-150"
//                   >
//                     <div className="flex items-center">
//                       <AcademicCapIcon className="h-5 w-5 text-blue-500 mr-3" />
//                       <div>
//                         <p className="text-sm font-medium text-gray-900">{formation.titre}</p>
//                         <p className="text-sm text-gray-500">
//                           Par {formation.formateur.nom} | {formation.participants.length} participants
//                         </p>
//                       </div>
//                     </div>
//                   </button>
//                 </li>
//               ))}
//             </ul>
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => navigate('/admin/formations')}
//                 className="text-blue-500 hover:text-blue-700 font-medium"
//               >
//                 Voir toutes les formations
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Formateurs récents */}
//         <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow">
//           <div className="p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveaux formateurs</h3>
//             <ul className="divide-y divide-gray-200">
//               {statistiques.formateursRecents?.map((formateur) => (
//                 <li key={formateur._id} className="py-3">
//                   <button
//                     onClick={() => navigate(`/admin/formateurs/${formateur._id}`)}
//                     className="w-full text-left hover:bg-gray-50 p-2 rounded transition-colors duration-150"
//                   >
//                     <div className="flex items-center">
//                       <UserIcon className="h-5 w-5 text-purple-500 mr-3" />
//                       <div>
//                         <p className="text-sm font-medium text-gray-900">
//                           {formateur.nom} {formateur.prenom}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           {formateur.email} | {formateur.formations.length} formations
//                         </p>
//                       </div>
//                     </div>
//                   </button>
//                 </li>
//               ))}
//             </ul>
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => navigate('/admin/formateurs')}
//                 className="text-blue-500 hover:text-blue-700 font-medium"
//               >
//                 Voir tous les formateurs
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TableauBord;
