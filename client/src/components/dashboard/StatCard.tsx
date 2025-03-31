import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
  icon: string;
  iconColor: string;
}

export default function StatCard({ title, value, change, icon, iconColor }: StatCardProps) {
  const colorClass = `bg-${iconColor} text-${iconColor}`;
  
  return (
    <Card className="overflow-hidden shadow">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 bg-opacity-10 rounded-md p-3 ${colorClass.replace('text-', 'bg-')}`}>
            <span className={`material-icons ${colorClass}`}>{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      {change && (
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className={`font-medium ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
              {change.value}
            </span>
            <span className="text-gray-500"> from last month</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
