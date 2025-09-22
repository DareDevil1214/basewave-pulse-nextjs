'use client';

import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Users
} from 'lucide-react';

interface PortalSelectorProps {
  selectedPortal: string;
  onPortalChange: (portal: string) => void;
}

const portals = [
  {
    id: 'newpeople',
    name: 'New People',
    description: 'AI-powered portfolio creation',
    icon: Users,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
];

export default function PortalSelector({ selectedPortal, onPortalChange }: PortalSelectorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Portal</h3>
          <Badge variant="outline" className="text-sm">
            Active: {portals.find(p => p.id === selectedPortal)?.name}
          </Badge>
        </div>
        
        <div className="flex justify-center">
          {portals.map((portal) => {
            const IconComponent = portal.icon;
            const isSelected = selectedPortal === portal.id;
            
            return (
              <Button
                key={portal.id}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto p-3 flex flex-col items-center gap-2 transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-offset-2 ring-blue-500' 
                    : 'hover:scale-105'
                }`}
                onClick={() => onPortalChange(portal.id)}
              >
                <IconComponent className={`w-5 h-5 ${
                  isSelected ? 'text-white' : 'text-gray-600'
                }`} />
                <div className="text-center">
                  <div className={`font-medium text-sm ${
                    isSelected ? 'text-white' : 'text-gray-900'
                  }`}>
                    {portal.name}
                  </div>
                  <div className={`text-xs ${
                    isSelected ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {portal.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
