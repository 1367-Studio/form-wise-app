import { Badge } from "@/components/ui/badge";

export default function TrialBanner() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex py-[6px] items-center justify-center gap-x-3 bg-blue-600 px-4 text-white">
      <p className="text-sm font-medium sm:text-base">Start your</p>
      <Badge className="bg-[#ffffff0f] border-[#ffffff0f] py-1 text-white">
        30-Days Free Trial
      </Badge>
    </div>
  );
}
