interface LandingPageProps {
  onEnter: () => void;
}

const sanofiLogo = 'https://cdn.prod.accelerator.sanofi/elements/icons/sanofi-logo.svg';

const LandingPage = ({ onEnter }: LandingPageProps) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer"
      onClick={onEnter}
    >
      <div
        className="bg-white shadow-xl border-2 border-slate-800 px-14 py-12 flex flex-col items-center gap-4 cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={onEnter}
      >
        <img src={sanofiLogo} alt="Sanofi" className="w-28" />
        <h2 className="text-slate-800 text-xl font-bold tracking-wide">Skills Lookup System</h2>
      </div>
    </div>
  );
};

export default LandingPage;
