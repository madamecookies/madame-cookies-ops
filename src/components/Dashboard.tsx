import React from 'react';
import { Card } from '@/components/ui/card';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Productions du jour', value: '0', color: 'text-primary' },
    { label: 'Températures relevées', value: '0', color: 'text-success' },
    { label: 'Nettoyages effectués', value: '0', color: 'text-warning' },
    { label: 'Réceptions en attente', value: '0', color: 'text-destructive' },
  ];

  const recentActivities: Array<{time: string, action: string, type: string}> = [];

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Madame Cookies PMS
        </h1>
        <p className="text-muted-foreground">
          Système de gestion de production
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="card-elegant p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">
              {stat.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Activités récentes
        </h2>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              Aucune activité récente
            </div>
          ) : (
            recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 rounded-lg bg-muted/50">
                <div className="text-sm font-medium text-primary min-w-12">
                  {activity.time}
                </div>
                <div className="text-sm text-foreground flex-1">
                  {activity.action}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Actions rapides
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-primary h-16 text-sm">
            Nouvelle<br />Production
          </button>
          <button className="btn-secondary h-16 text-sm">
            Relevé<br />Température
          </button>
          <button className="btn-success h-16 text-sm">
            Nettoyage<br />Express
          </button>
          <button className="btn-warning h-16 text-sm">
            Export<br />Données
          </button>
        </div>
      </Card>
    </div>
  );
};