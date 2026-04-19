export default function FormSection({ title, description, children, icon: Icon, className = "" }) {
  return (
    <section className={`rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 ${className}`}>
      <div className="mb-6 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
           {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Icon className="h-5 w-5" />
              </div>
           )}
           <div>
              {title && <h3 className="text-xl font-bold tracking-tight text-slate-900">{title}</h3>}
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
           </div>
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}
