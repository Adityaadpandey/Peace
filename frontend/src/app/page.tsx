'use client';
import Spline from '@splinetool/react-spline';
import { Application } from '@splinetool/runtime';
import { Orbitron } from 'next/font/google';
import Navbar from './_components/Navbar';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['700'] });

export default function Home() {
  function onLoad(spline: Application) {
    // spline.play();
    spline.canvas.style.scale = '1.5';
  }

  return (
    <div>
      <main className='max-h-screen overflow-hidden'>
        <Navbar className='fixed -z-10' />
        <Spline
          onLoad={onLoad}
          scene="https://prod.spline.design/GGFqhs3CbugFAs4K/scene.splinecode"
        />
      </main>
      <footer className='fixed bottom-0 h-[20dvh] w-screen flex justify-between -z-10'>
        <div className={`${orbitron.className} text-8xl p-4 text-center flex-1`}>
          Sukoon AI
        </div>
      </footer>
    </div>
  );
}
