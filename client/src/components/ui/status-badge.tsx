import { Badge } from "@/components/ui/badge";

type StatusType = "safe" | "suspicious" | "fraudulent";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusType = status as StatusType;
  
  const getStatusStyles = () => {
    switch (statusType) {
      case "safe":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "suspicious":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "fraudulent":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };
  
  const getStatusText = () => {
    return statusType.charAt(0).toUpperCase() + statusType.slice(1);
  };
  
  return (
    <Badge 
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles()}`}
      variant="outline"
    >
      {getStatusText()}
    </Badge>
  );
}
