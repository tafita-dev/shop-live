import { AddCategory } from '@/components/AddCategorie';
import CategoriesListes from '@/components/CategorieListe';
import React, { useState } from 'react';

const categorie = () => {
  const [step, setStep] = useState(1);

  return (
    <>
      {step === 1 && <CategoriesListes setStep={setStep} />}
      {step === 2 && <AddCategory setStep={setStep} />}
    </>
  );
};

export default categorie;
