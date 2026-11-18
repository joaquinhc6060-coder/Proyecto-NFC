import React from 'react';
import ContactForm from '../components/ContactForm';

export default function ContactoPage() {
  return (
    <div className="min-h-[85vh] bg-[#07080a] text-white">
      <div className="mx-auto w-[calc(100%-48px)] max-w-[980px] px-0 pb-8 pt-20 text-center sm:pb-12 sm:pt-28">
        <p className="text-lg font-medium tracking-tight text-zinc-300 sm:text-2xl">
          Para soporte rápido, escríbenos a Instagram:{' '}
          <a
            href="https://www.instagram.com/vigio.cl/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-black text-orange-brand transition hover:text-teal-brand"
          >
            @vigio.cl ↗
          </a>
        </p>
        <h1 className="mt-10 text-2xl font-black tracking-[-0.02em] text-white sm:mt-14 sm:text-3xl">
          La respuesta por correo puede tardar más.
        </h1>
      </div>
      <ContactForm />
    </div>
  );
}
