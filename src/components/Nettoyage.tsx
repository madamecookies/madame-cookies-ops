import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface NettoyageData {
  id: string;
  zone: string;
  produit: string;
  heure: string;
  operateur: string;
  actions: string[];
  observations: string;
  datetime: string;
}

const ZONES_NETTOYAGE = [
  'Plan de travail principal',
  'Plan de travail secondaire',
  'Four principal',
  'Four secondaire',
  'Évier',
  'Sol atelier',
  'Réfrigérateur',
  'Chambre froide',
  'Zone stockage',
];

const PRODUITS_NETTOYAGE = [
  'Dégraissant alimentaire',
  'Désinfectant contact alimentaire',
  'Eau + savon',
  'Alcool 70°',
  'Javel diluée',
];

const ACTIONS_NETTOYAGE = [
  'Débarrassage',
  'Dépoussiérage',
  'Lavage',
  'Rinçage',
  'Désinfection',
  'Séchage',
  'Contrôle visuel',
];

export const Nettoyage: React.FC = () => {
  const [formData, setFormData] = useState({
    zone: '',
    produit: '',
    heure: '',
    operateur: '',
    observations: '',
  });

  const [actionsSelectionnees, setActionsSelectionnees] = useState<string[]>([]);
  const [nettoyages, setNettoyages] = useState<NettoyageData[]>([]);

  React.useEffect(() => {
    // Charger les nettoyages depuis localStorage
    const data = JSON.parse(localStorage.getItem('madame_cookies_data') || '{}');
    if (data.nettoyages) {
      setNettoyages(data.nettoyages);
    }
    
    // Pré-remplir l'heure actuelle
    setFormData(prev => ({
      ...prev,
      heure: new Date().toTimeString().slice(0, 5)
    }));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAction = (action: string) => {
    setActionsSelectionnees(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  const enregistrerNettoyage = () => {
    if (!formData.zone || !formData.produit || !formData.heure || actionsSelectionnees.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires et sélectionner au moins une action');
      return;
    }

    const nouveauNettoyage: NettoyageData = {
      id: `nett_${Date.now()}`,
      zone: formData.zone,
      produit: formData.produit,
      heure: formData.heure,
      operateur: formData.operateur,
      actions: [...actionsSelectionnees],
      observations: formData.observations,
      datetime: new Date().toISOString(),
    };

    const nouvelleListe = [nouveauNettoyage, ...nettoyages];
    setNettoyages(nouvelleListe);

    // Sauvegarder dans localStorage
    const existingData = JSON.parse(localStorage.getItem('madame_cookies_data') || '{}');
    if (!existingData.nettoyages) existingData.nettoyages = [];
    existingData.nettoyages = nouvelleListe;
    localStorage.setItem('madame_cookies_data', JSON.stringify(existingData));

    // Reset du formulaire
    setFormData({
      zone: '',
      produit: '',
      heure: new Date().toTimeString().slice(0, 5),
      operateur: formData.operateur, // Garder l'opérateur
      observations: '',
    });
    setActionsSelectionnees([]);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Nettoyage
        </h1>
        <p className="text-muted-foreground">
          Traçabilité des opérations de nettoyage
        </p>
      </div>

      {/* Formulaire de saisie */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Nouvelle opération
        </h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="zone">Zone *</Label>
            <Select onValueChange={(value) => handleInputChange('zone', value)}>
              <SelectTrigger className="input-mobile">
                <SelectValue placeholder="Sélectionner une zone" />
              </SelectTrigger>
              <SelectContent>
                {ZONES_NETTOYAGE.map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="produit">Produit utilisé *</Label>
            <Select onValueChange={(value) => handleInputChange('produit', value)}>
              <SelectTrigger className="input-mobile">
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {PRODUITS_NETTOYAGE.map(produit => (
                  <SelectItem key={produit} value={produit}>{produit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heure">Heure *</Label>
              <Input
                id="heure"
                type="time"
                className="input-mobile"
                value={formData.heure}
                onChange={(e) => handleInputChange('heure', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="operateur">Opérateur</Label>
              <Input
                id="operateur"
                className="input-mobile"
                value={formData.operateur}
                onChange={(e) => handleInputChange('operateur', e.target.value)}
                placeholder="Nom de l'opérateur"
              />
            </div>
          </div>

          <div>
            <Label>Actions réalisées *</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ACTIONS_NETTOYAGE.map(action => (
                <div key={action} className="flex items-center space-x-2">
                  <Checkbox
                    id={action}
                    checked={actionsSelectionnees.includes(action)}
                    onCheckedChange={() => toggleAction(action)}
                  />
                  <Label htmlFor={action} className="text-sm">
                    {action}
                  </Label>
                </div>
              ))}
            </div>
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

          <button 
            onClick={enregistrerNettoyage}
            className="btn-success w-full"
          >
            Enregistrer nettoyage
          </button>
        </div>
      </Card>

      {/* Historique des nettoyages */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Nettoyages du jour
        </h2>
        
        {nettoyages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun nettoyage enregistré aujourd'hui
          </div>
        ) : (
          <div className="space-y-3">
            {nettoyages.slice(0, 10).map((nettoyage) => (
              <div key={nettoyage.id} className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-foreground">
                      {nettoyage.zone}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {nettoyage.heure} • {nettoyage.produit}
                      {nettoyage.operateur && ` • ${nettoyage.operateur}`}
                    </div>
                  </div>
                  <div className="text-success text-sm font-medium">
                    ✓ Terminé
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {nettoyage.actions.map(action => (
                    <span key={action} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {action}
                    </span>
                  ))}
                </div>
                
                {nettoyage.observations && (
                  <div className="text-sm text-muted-foreground">
                    {nettoyage.observations}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Planning des zones */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          État des zones
        </h2>
        
        <div className="space-y-2">
          {ZONES_NETTOYAGE.map(zone => {
            const dernierNettoyage = nettoyages.find(n => n.zone === zone);
            const estNettoye = dernierNettoyage && 
              new Date(dernierNettoyage.datetime).toDateString() === new Date().toDateString();
            
            return (
              <div key={zone} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="text-sm text-foreground">
                  {zone}
                </div>
                <div className={`text-sm font-medium ${estNettoye ? 'text-success' : 'text-warning'}`}>
                  {estNettoye ? '✓ Nettoyé' : '⚠ À nettoyer'}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};