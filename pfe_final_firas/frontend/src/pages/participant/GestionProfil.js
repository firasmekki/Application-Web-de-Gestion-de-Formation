import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Grid,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { modifierProfil, changerMotDePasse } from '../../redux/slices/authSlice';

const GestionProfil = () => {
  const dispatch = useDispatch();
  const { utilisateur } = useSelector((state) => state.auth);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogMotDePasseOuvert, setDialogMotDePasseOuvert] = useState(false);
  
  const [profilData, setProfilData] = useState({
    nom: utilisateur.nom || '',
    prenom: utilisateur.prenom || '',
    email: utilisateur.email || '',
    telephone: utilisateur.telephone || '',
    bio: utilisateur.bio || '',
    photo: utilisateur.photo || null,
  });

  const [motDePasseData, setMotDePasseData] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmationMotDePasse: '',
  });

  const handleChangementPhoto = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilData((prev) => ({
          ...prev,
          photo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangementProfil = (e) => {
    const { name, value } = e.target;
    setProfilData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSauvegarderProfil = async () => {
    try {
      setError('');
      setSuccess('');
      await dispatch(modifierProfil(profilData)).unwrap();
      setSuccess('Profil mis à jour avec succès');
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  const handleChangerMotDePasse = async () => {
    if (motDePasseData.nouveauMotDePasse !== motDePasseData.confirmationMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setError('');
      setSuccess('');
      await dispatch(changerMotDePasse({
        ancienMotDePasse: motDePasseData.ancienMotDePasse,
        nouveauMotDePasse: motDePasseData.nouveauMotDePasse,
      })).unwrap();
      setSuccess('Mot de passe changé avec succès');
      setDialogMotDePasseOuvert(false);
      setMotDePasseData({
        ancienMotDePasse: '',
        nouveauMotDePasse: '',
        confirmationMotDePasse: '',
      });
    } catch (err) {
      setError('Erreur lors du changement de mot de passe');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Mon Profil
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={profilData.photo}
            sx={{ width: 120, height: 120, mb: 2 }}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            type="file"
            onChange={handleChangementPhoto}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<PhotoCameraIcon />}
            >
              Changer la photo
            </Button>
          </label>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom"
              name="nom"
              value={profilData.nom}
              onChange={handleChangementProfil}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Prénom"
              name="prenom"
              value={profilData.prenom}
              onChange={handleChangementProfil}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={profilData.email}
              onChange={handleChangementProfil}
              type="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Téléphone"
              name="telephone"
              value={profilData.telephone}
              onChange={handleChangementProfil}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={profilData.bio}
              onChange={handleChangementProfil}
              multiline
              rows={4}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={() => setDialogMotDePasseOuvert(true)}
          >
            Changer le mot de passe
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSauvegarderProfil}
          >
            Sauvegarder les modifications
          </Button>
        </Box>
      </Paper>

      {/* Dialog de changement de mot de passe */}
      <Dialog
        open={dialogMotDePasseOuvert}
        onClose={() => setDialogMotDePasseOuvert(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Changer le mot de passe
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Ancien mot de passe"
              type="password"
              value={motDePasseData.ancienMotDePasse}
              onChange={(e) => setMotDePasseData((prev) => ({
                ...prev,
                ancienMotDePasse: e.target.value,
              }))}
            />
            <TextField
              fullWidth
              label="Nouveau mot de passe"
              type="password"
              value={motDePasseData.nouveauMotDePasse}
              onChange={(e) => setMotDePasseData((prev) => ({
                ...prev,
                nouveauMotDePasse: e.target.value,
              }))}
            />
            <TextField
              fullWidth
              label="Confirmer le nouveau mot de passe"
              type="password"
              value={motDePasseData.confirmationMotDePasse}
              onChange={(e) => setMotDePasseData((prev) => ({
                ...prev,
                confirmationMotDePasse: e.target.value,
              }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMotDePasseOuvert(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleChangerMotDePasse}
            variant="contained"
            color="primary"
          >
            Changer le mot de passe
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GestionProfil;
