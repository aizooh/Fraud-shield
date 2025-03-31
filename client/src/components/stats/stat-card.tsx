import { StatCardProps } from "@/types";

export default function StatCard({ title, value, percentChange, icon, iconBgColor, iconColor }: StatCardProps) {
  const isPositiveChange = percentChange !== undefined && percentChange >= 0;
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} bg-opacity-10 rounded-md p-3`}>
            <span className={`material-icons ${iconColor}`}>{icon}</span>
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
      </div>
      {percentChange !== undefined && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className={`font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveChange ? '+' : ''}{percentChange}%
            </span>
            <span className="text-gray-500"> from last month</span>
          </div>
        </div>
      )}
    </div>
  );
}
