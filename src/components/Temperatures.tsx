import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TemperatureData {
  id: string;
  zone: string;
  temperature: number;
  heure: string;
  operateur: string;
  datetime: string;
}

const ZONES_TEMPERATURE = [
  'Four principal',
  'Four secondaire', 
  'Chambre froide',
  'Zone de préparation',
  'Zone de stockage',
  'Réfrigérateur',
];

export const Temperatures: React.FC = () => {
  const [formData, setFormData] = useState({
    zone: '',
    temperature: '',
    heure: '',
    operateur: '',
  });

  const [temperatures, setTemperatures] = useState<TemperatureData[]>([]);

  React.useEffect(() => {
    // Charger les températures depuis localStorage
    const data = JSON.parse(localStorage.getItem('madame_cookies_data') || '{}');
    if (data.temperatures) {
      setTemperatures(data.temperatures);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const ajouterTemperature = () => {
    if (!formData.zone || !formData.temperature || !formData.heure) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const nouvelleTemperature: TemperatureData = {
      id: `temp_${Date.now()}`,
      zone: formData.zone,
      temperature: parseFloat(formData.temperature),
      heure: formData.heure,
      operateur: formData.operateur,
      datetime: new Date().toISOString(),
    };

    const nouvelleListe = [nouvelleTemperature, ...temperatures];
    setTemperatures(nouvelleListe);

    // Sauvegarder dans localStorage
    const existingData = JSON.parse(localStorage.getItem('madame_cookies_data') || '{}');
    if (!existingData.temperatures) existingData.temperatures = [];
    existingData.temperatures = nouvelleListe;
    localStorage.setItem('madame_cookies_data', JSON.stringify(existingData));

    // Reset du formulaire
    setFormData({
      zone: '',
      temperature: '',
      heure: new Date().toTimeString().slice(0, 5),
      operateur: formData.operateur, // Garder l'opérateur
    });
  };

  const getTemperatureColor = (temp: number, zone: string) => {
    if (zone.includes('Four')) {
      return temp >= 160 && temp <= 200 ? 'text-success' : 'text-warning';
    }
    if (zone.includes('froide') || zone.includes('frigérateur')) {
      return temp >= 0 && temp <= 4 ? 'text-success' : 'text-destructive';
    }
    return temp >= 18 && temp <= 25 ? 'text-success' : 'text-warning';
  };

  React.useEffect(() => {
    // Pré-remplir l'heure actuelle
    setFormData(prev => ({
      ...prev,
      heure: new Date().toTimeString().slice(0, 5)
    }));
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Températures
        </h1>
        <p className="text-muted-foreground">
          Relevés de température
        </p>
      </div>

      {/* Formulaire de saisie */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Nouveau relevé
        </h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="zone">Zone *</Label>
            <Select onValueChange={(value) => handleInputChange('zone', value)}>
              <SelectTrigger className="input-mobile">
                <SelectValue placeholder="Sélectionner une zone" />
              </SelectTrigger>
              <SelectContent>
                {ZONES_TEMPERATURE.map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperature">Température (°C) *</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                className="input-mobile"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                placeholder="ex: 180.5"
              />
            </div>
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

          <button 
            onClick={ajouterTemperature}
            className="btn-primary w-full"
          >
            Enregistrer relevé
          </button>
        </div>
      </Card>

      {/* Historique des relevés */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Relevés du jour
        </h2>
        
        {temperatures.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun relevé de température enregistré
          </div>
        ) : (
          <div className="space-y-3">
            {temperatures.slice(0, 10).map((temp) => (
              <div key={temp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div>
                  <div className="font-medium text-foreground">
                    {temp.zone}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {temp.heure} {temp.operateur && `• ${temp.operateur}`}
                  </div>
                </div>
                <div className={`text-xl font-bold ${getTemperatureColor(temp.temperature, temp.zone)}`}>
                  {temp.temperature}°C
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Résumé des zones */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          État des zones
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {ZONES_TEMPERATURE.map(zone => {
            const dernierReleve = temperatures.find(t => t.zone === zone);
            return (
              <div key={zone} className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                <div className="text-sm font-medium text-foreground mb-1">
                  {zone}
                </div>
                {dernierReleve ? (
                  <div className={`text-lg font-bold ${getTemperatureColor(dernierReleve.temperature, zone)}`}>
                    {dernierReleve.temperature}°C
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Pas de relevé
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};