import React from "react";
import Skeleton from "./common/Skeleton";

export default function PolicyCardSkeleton() {
 return (
 <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md ">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <Skeleton variant="custom" className="h-12 w-12 rounded-xl" />
 <div>
 <Skeleton variant="text" width="60%" className="mb-1 h-5" />
 <Skeleton variant="text" width="40%" className="h-4" />
 </div>
 </div>
 <Skeleton variant="custom" className="h-6 w-16 rounded-full" />
 </div>
 <div className="mt-5 space-y-2">
 <Skeleton variant="text" className="h-6" />
 <Skeleton variant="text" className="h-4" />
 <Skeleton variant="text" width="80%" className="h-4" />
 </div>
 <div className="mt-auto pt-6">
 <div className="flex items-end justify-between border-t border-slate-100 pt-5 ">
 <div>
 <Skeleton variant="text" width="50px" className="mb-1 h-4" />
 <Skeleton variant="title" width="80px" className="h-7" />
 </div>
 <Skeleton variant="custom" className="h-10 w-28 rounded-xl" />
 </div>
 </div>
 </div>
 );
}
