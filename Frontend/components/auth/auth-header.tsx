export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">
        LibMan
      </h1>
      <p className="font-headline-md text-body-lg text-on-surface mb-1">{title}</p>
      <p className="text-on-surface-variant text-body-md">{subtitle}</p>
    </div>
  );
}
