import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Camera } from 'lucide-react';
import { AdvancedOCR } from './AdvancedOCR';

interface MatierePremiere {
  nom: string;
  quantiteBase: number;
  unite: string;
}

interface RecetteMP {
  [key: string]: MatierePremiere[];
}

interface ProductionData {
  id: string;
  lot: string;
  variete: string;
  quantite: number;
  debut: string;
  fin: string;
  temperature: number;
  observations: string;
  mpEtiquettes: Array<{
    nom: string;
    quantiteNecessaire: number;
    unite: string;
    lot: string;
    dlc: string;
    photoId?: string;
  }>;
  datetime: string;
}

const OPERATEURS = [
  'WENDY',
  'THIBAUD', 
  'RAPHAEL',
  'DAMIEN',
  'AMELIE',
  'NYLAIME'
];

const FOURNISSEURS = [
  'FRAIS IMPORT',
  'REUDIS',
  'PATELLIN', 
  'OVOCOOP'
];

const RECETTES: RecetteMP = {
  '3_CHOCOLAT': [
    { nom: 'Farine T55', quantiteBase: 500, unite: 'g' },
    { nom: 'Beurre doux', quantiteBase: 250, unite: 'g' },
    { nom: 'Sucre blanc', quantiteBase: 200, unite: 'g' },
    { nom: 'Œufs', quantiteBase: 2, unite: 'pièces' },
    { nom: 'Chocolat noir', quantiteBase: 150, unite: 'g' },
    { nom: 'Chocolat au lait', quantiteBase: 100, unite: 'g' },
    { nom: 'Chocolat blanc', quantiteBase: 75, unite: 'g' },
    { nom: 'Levure chimique', quantiteBase: 8, unite: 'g' },
    { nom: 'Sel fin', quantiteBase: 3, unite: 'g' },
  ],
  'PEPITES_CHOCO': [
    { nom: 'Farine T55', quantiteBase: 450, unite: 'g' },
    { nom: 'Beurre doux', quantiteBase: 200, unite: 'g' },
    { nom: 'Sucre roux', quantiteBase: 180, unite: 'g' },
    { nom: 'Œufs', quantiteBase: 1, unite: 'pièces' },
    { nom: 'Pépites chocolat', quantiteBase: 200, unite: 'g' },
    { nom: 'Levure chimique', quantiteBase: 6, unite: 'g' },
    { nom: 'Sel fin', quantiteBase: 2, unite: 'g' },
  ],
};

const genererNumeroLot = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return `MC${year}${month}${day}-${hours}${minutes}`;
};

export const Production: React.FC = () => {
  const [formData, setFormData] = useState({
    lot: '',
    variete: '',
    quantite: '',
    debut: '',
    fin: '',
    temperature: '',
    observations: '',
    operateur: '',
  });

  const [matieresPremieresData, setMatieresPremieresData] = useState<Array<{
    nom: string;
    quantiteNecessaire: number;
    unite: string;
    lot: string;
    dlc: string;
    photoId?: string;
  }>>([]);

  const [showCamera, setShowCamera] = useState<string | null>(null);
  const [photosData, setPhotosData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Auto-générer le numéro de lot au chargement
    setFormData(prev => ({
      ...prev,
      lot: genererNumeroLot()
    }));
  }, []);

  useEffect(() => {
    // Calculer les matières premières nécessaires
    if (formData.variete && formData.quantite) {
      const recette = RECETTES[formData.variete];
      if (recette) {
        const quantiteTotal = parseInt(formData.quantite);
        const facteur = quantiteTotal / 20; // Base pour 20 cookies
        
        const matieres = recette.map(mp => ({
          nom: mp.nom,
          quantiteNecessaire: Math.round(mp.quantiteBase * facteur * 100) / 100,
          unite: mp.unite,
          lot: '',
          dlc: '',
        }));
        
        setMatieresPremieresData(matieres);
      }
    } else {
      setMatieresPremieresData([]);
    }
  }, [formData.variete, formData.quantite]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMPChange = (index: number, field: string, value: string) => {
    setMatieresPremieresData(prev => 
      prev.map((mp, i) => 
        i === index ? { ...mp, [field]: value } : mp
      )
    );
  };

  const regenererLot = () => {
    setFormData(prev => ({
      ...prev,
      lot: genererNumeroLot()
    }));
  };

  const ouvrirCamera = (mpNom: string) => {
    setShowCamera(mpNom);
  };

  const handleCameraCapture = (imageData: string, ocrResult?: { lot?: string; dlc?: string }) => {
    if (showCamera) {
      setPhotosData(prev => ({
        ...prev,
        [showCamera]: imageData
      }));
      
      // Utiliser les résultats de l'OCR pour pré-remplir les champs
      const mpIndex = matieresPremieresData.findIndex(mp => mp.nom === showCamera);
      if (mpIndex !== -1) {
        if (ocrResult?.lot) {
          handleMPChange(mpIndex, 'lot', ocrResult.lot);
        }
        if (ocrResult?.dlc) {
          handleMPChange(mpIndex, 'dlc', ocrResult.dlc);
        }
      }
    }
    setShowCamera(null);
  };

  const validerProduction = () => {
    // Validation: chaque MP doit avoir un lot
    const mpInvalides = matieresPremieresData.filter(mp => !mp.lot);
    
    if (mpInvalides.length > 0) {
      alert(`Veuillez renseigner le numéro de lot pour: ${mpInvalides.map(mp => mp.nom).join(', ')}`);
      return;
    }

    // Validation des champs obligatoires
    if (!formData.operateur || !formData.variete || !formData.quantite || !formData.debut) {
      alert('Veuillez remplir tous les champs obligatoires (opérateur, variété, quantité, heure début)');
      return;
    }

    // Sauvegarder la production
    const production: ProductionData = {
      id: `prod_${Date.now()}`,
      lot: formData.lot,
      variete: formData.variete,
      quantite: parseInt(formData.quantite),
      debut: formData.debut,
      fin: formData.fin,
      temperature: parseInt(formData.temperature) || 0,
      observations: formData.observations,
      mpEtiquettes: matieresPremieresData,
      datetime: new Date().toISOString(),
    };

    // Sauvegarder dans localStorage
    const existingData = JSON.parse(localStorage.getItem('madame_cookies_data') || '{}');
    if (!existingData.productions) existingData.productions = [];
    existingData.productions.push(production);
    localStorage.setItem('madame_cookies_data', JSON.stringify(existingData));

    alert('Production enregistrée avec succès!');
    
    // Reset du formulaire
    setFormData({
      lot: genererNumeroLot(),
      variete: '',
      quantite: '',
      debut: '',
      fin: '',
      temperature: '',
      observations: '',
      operateur: '',
    });
    setMatieresPremieresData([]);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Production
        </h1>
        <p className="text-muted-foreground">
          Gestion des lots de production
        </p>
      </div>

      {/* Informations production */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Informations production
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Label htmlFor="lot">N° Lot (auto-généré)</Label>
              <Input
                id="lot"
                className="input-mobile"
                value={formData.lot}
                readOnly
              />
            </div>
            <button 
              onClick={regenererLot}
              className="btn-secondary mt-6 text-sm px-3"
            >
              ↻
            </button>
          </div>

          <div>
            <Label htmlFor="operateur">Opérateur *</Label>
            <Select onValueChange={(value) => handleInputChange('operateur', value)}>
              <SelectTrigger className="input-mobile">
                <SelectValue placeholder="Choisir un opérateur" />
              </SelectTrigger>
              <SelectContent>
                {OPERATEURS.map(op => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="variete">Variété Cookie *</Label>
            <Select onValueChange={(value) => handleInputChange('variete', value)}>
              <SelectTrigger className="input-mobile">
                <SelectValue placeholder="Choisir une recette" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3_CHOCOLAT">3 CHOCOLAT</SelectItem>
                <SelectItem value="PEPITES_CHOCO">PÉPITES CHOCOLAT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantite">Quantité totale (pièces) *</Label>
            <Input
              id="quantite"
              type="number"
              className="input-mobile"
              value={formData.quantite}
              onChange={(e) => handleInputChange('quantite', e.target.value)}
              placeholder="ex: 50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="debut">Heure début *</Label>
              <Input
                id="debut"
                type="time"
                className="input-mobile"
                value={formData.debut}
                onChange={(e) => handleInputChange('debut', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fin">Heure fin</Label>
              <Input
                id="fin"
                type="time"
                className="input-mobile"
                value={formData.fin}
                onChange={(e) => handleInputChange('fin', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="temperature">Température four (°C)</Label>
            <Input
              id="temperature"
              type="number"
              className="input-mobile"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              placeholder="ex: 180"
            />
          </div>

          <div>
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              className="input-mobile min-h-20"
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Remarques particulières..."
            />
          </div>
        </div>
      </Card>

      {/* Matières premières */}
      {matieresPremieresData.length > 0 && (
        <Card className="card-elegant p-4">
          <h2 className="text-lg font-semibold mb-4 text-primary">
            Matières Premières
          </h2>
          
          <div className="space-y-4">
            {matieresPremieresData.map((mp, index) => (
              <div key={index} className="border border-border rounded-lg p-3 bg-muted/30">
                <div className="font-medium text-foreground mb-2">
                  {mp.nom}
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  Quantité nécessaire: {mp.quantiteNecessaire} {mp.unite}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label>N° de lot *</Label>
                    <Input
                      className="input-mobile"
                      value={mp.lot}
                      onChange={(e) => handleMPChange(index, 'lot', e.target.value)}
                      placeholder="Saisir le lot"
                    />
                  </div>
                  <div>
                    <Label>DLC</Label>
                    <Input
                      type="date"
                      className="input-mobile"
                      value={mp.dlc}
                      onChange={(e) => handleMPChange(index, 'dlc', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => ouvrirCamera(mp.nom)}
                    className="btn-primary w-full text-sm"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    📷 Étiquette (OCR)
                  </button>
                  
                  {photosData[mp.nom] && (
                    <div className="text-center">
                      <img 
                        src={photosData[mp.nom]} 
                        alt="Photo étiquette" 
                        className="w-20 h-20 object-cover rounded border mx-auto"
                      />
                      <p className="text-xs text-green-600 mt-1">✓ Photo capturée</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <button 
          onClick={validerProduction}
          className="btn-success flex-1"
        >
          Enregistrer Production
        </button>
      </div>

      {/* Camera Component */}
      <AdvancedOCR
        isOpen={!!showCamera}
        title={`Photo étiquette: ${showCamera || ''}`}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(null)}
      />
    </div>
  );
};