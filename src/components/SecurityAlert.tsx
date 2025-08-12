
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface SecurityAlertProps {
  level: 'low' | 'medium' | 'high';
  message: string;
  details?: string[];
  className?: string;
}

export const SecurityAlert = ({ level, message, details, className }: SecurityAlertProps) => {
  const getAlertProps = () => {
    switch (level) {
      case 'high':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          badgeColor: 'bg-red-100 text-red-700 border-red-200'
        };
      case 'medium':
        return {
          variant: 'default' as const,
          icon: Shield,
          badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
      default:
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          badgeColor: 'bg-green-100 text-green-700 border-green-200'
        };
    }
  };

  const { variant, icon: Icon, badgeColor } = getAlertProps();

  return (
    <Alert variant={variant} className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {message}
          </AlertDescription>
        </div>
        <Badge variant="outline" className={badgeColor}>
          Security Level: {level.toUpperCase()}
        </Badge>
      </div>
      {details && details.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            {details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}
    </Alert>
  );
};
