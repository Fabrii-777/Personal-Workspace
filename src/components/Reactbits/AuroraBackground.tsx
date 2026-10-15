import React from 'react';

export const AuroraBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Esfera 1: Índigo profundo */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[130px] animate-aurora-1" />
      {/* Esfera 2: Fucsia / Violeta vibrante */}
      <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-purple-500/15 dark:bg-purple-600/20 rounded-full blur-[140px] animate-aurora-2" />
      {/* Esfera 3: Cian / Esmeralda tech */}
      <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[120px] animate-aurora-3" />
      {/* Rejilla sutil futurista */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
    </div>
  );
};