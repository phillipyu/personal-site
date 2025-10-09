import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:h-screen lg:items-center lg:justify-center lg:px-8">
        <div className="flex items-center gap-24 max-w-6xl">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-96 h-96 relative overflow-hidden rounded-full">
              <Image
                src="/profile.jpg"
                alt="Phillip Yu"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-12">
            {/* Header */}
            <header className="space-y-6">
              <div className="flex items-center gap-12">
                <h1 className="text-6xl font-normal">Phillip Yu</h1>
                <nav className="flex gap-8">
                  <a href="#writing" className="text-lg underline hover:no-underline">writing</a>
                  <a href="#projects" className="text-lg underline hover:no-underline">projects</a>
                </nav>
              </div>
            </header>
            
            {/* Bio */}
            <div className="space-y-6 text-lg leading-relaxed max-w-2xl">
              <p>
                I am a full-stack software engineer based out of NYC. Most recently, 
                I've been tinkering around with ideas in AI x healthcare.
              </p>
              
              <div className="space-y-3">
                <p>Previously, I:</p>
                <ul className="space-y-2 ml-1">
                  <li className="flex items-start gap-3">
                    <span className="text-sm mt-2">■</span>
                    <span>was an early engineer at <a href="https://merge.dev" className="underline hover:no-underline">Merge</a>, where I built and scaled Merge's core distributed syncing engine</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-sm mt-2">■</span>
                    <span>was an early-ish engineer at <a href="https://asana.com" className="underline hover:no-underline">Asana</a>, where I built product features across web, mobile, and our API</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-sm mt-2">🎓</span>
                    <span>studied computer science and statistics at Harvard, where I taught <a href="https://cs50.harvard.edu" className="underline hover:no-underline">CS50</a> and interned at Microsoft</span>
                  </li>
                </ul>
              </div>
              
              <p>
                My hobbies include teaching, racket sports, hiking, reading, history, and new languages.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-1 text-lg">
                <a href="https://linkedin.com/in/phillipyu" className="underline hover:no-underline">linkedin</a>
                <span> | </span>
                <a href="https://github.com/phillipyu" className="underline hover:no-underline">github</a>
                <span> | </span>
                <a href="mailto:your-email@example.com" className="underline hover:no-underline">email</a>
                <span> | </span>
                <a href="https://twitter.com/phillipyu" className="underline hover:no-underline">twitter</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:block lg:hidden px-8 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <header className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-normal">Phillip Yu</h1>
              <nav className="flex justify-center gap-6">
                <a href="#writing" className="text-lg underline hover:no-underline">writing</a>
                <a href="#projects" className="text-lg underline hover:no-underline">projects</a>
              </nav>
            </div>
          </header>
          
          {/* Profile Image */}
          <div className="flex justify-center">
            <div className="w-64 h-64 relative overflow-hidden rounded-full">
              <Image
                src="/profile.jpg"
                alt="Phillip Yu"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          {/* Bio */}
          <div className="space-y-6 text-base leading-relaxed">
            <p>
              I am a full-stack software engineer based out of NYC. Most recently, 
              I've been tinkering around with ideas in AI x healthcare.
            </p>
            
            <div className="space-y-3">
              <p>Previously, I:</p>
              <ul className="space-y-2 ml-1">
                <li className="flex items-start gap-3">
                  <span className="text-sm mt-1">■</span>
                  <span>was an early engineer at <a href="https://merge.dev" className="underline hover:no-underline">Merge</a>, where I built and scaled Merge's core distributed syncing engine</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sm mt-1">■</span>
                  <span>was an early-ish engineer at <a href="https://asana.com" className="underline hover:no-underline">Asana</a>, where I built product features across web, mobile, and our API</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sm mt-1">🎓</span>
                  <span>studied computer science and statistics at Harvard, where I taught <a href="https://cs50.harvard.edu" className="underline hover:no-underline">CS50</a> and interned at Microsoft</span>
                </li>
              </ul>
            </div>
            
            <p>
              My hobbies include teaching, racket sports, hiking, reading, history, and new languages.
            </p>
            
            {/* Social Links */}
            <div className="flex justify-center gap-1 text-base">
              <a href="https://linkedin.com/in/phillipyu" className="underline hover:no-underline">linkedin</a>
              <span> | </span>
              <a href="https://github.com/phillipyu" className="underline hover:no-underline">github</a>
              <span> | </span>
              <a href="mailto:your-email@example.com" className="underline hover:no-underline">email</a>
              <span> | </span>
              <a href="https://twitter.com/phillipyu" className="underline hover:no-underline">twitter</a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <header className="text-center space-y-4">
            <h1 className="text-3xl font-normal">Phillip Yu</h1>
            <nav className="flex justify-center gap-6">
              <a href="#writing" className="text-base underline hover:no-underline">writing</a>
              <a href="#projects" className="text-base underline hover:no-underline">projects</a>
            </nav>
          </header>
          
          {/* Profile Image */}
          <div className="flex justify-center">
            <div className="w-48 h-48 relative overflow-hidden rounded-full">
              <Image
                src="/profile.jpg"
                alt="Phillip Yu"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          {/* Bio */}
          <div className="space-y-6 text-sm leading-relaxed">
            <p>
              I am a full-stack software engineer based out of NYC. Most recently, 
              I've been tinkering around with ideas in AI x healthcare.
            </p>
            
            <div className="space-y-3">
              <p>Previously, I:</p>
              <ul className="space-y-2 ml-1">
                <li className="flex items-start gap-2">
                  <span className="text-xs mt-1">■</span>
                  <span>was an early engineer at <a href="https://merge.dev" className="underline hover:no-underline">Merge</a>, where I built and scaled Merge's core distributed syncing engine</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xs mt-1">■</span>
                  <span>was an early-ish engineer at <a href="https://asana.com" className="underline hover:no-underline">Asana</a>, where I built product features across web, mobile, and our API</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xs mt-1">🎓</span>
                  <span>studied computer science and statistics at Harvard, where I taught <a href="https://cs50.harvard.edu" className="underline hover:no-underline">CS50</a> and interned at Microsoft</span>
                </li>
              </ul>
            </div>
            
            <p>
              My hobbies include teaching, racket sports, hiking, reading, history, and new languages.
            </p>
            
            {/* Social Links */}
            <div className="text-center text-sm">
              <div className="flex justify-center gap-1">
                <a href="https://linkedin.com/in/phillipyu" className="underline hover:no-underline">linkedin</a>
                <span> | </span>
                <a href="https://github.com/phillipyu" className="underline hover:no-underline">github</a>
              </div>
              <div className="flex justify-center gap-1 mt-1">
                <a href="mailto:your-email@example.com" className="underline hover:no-underline">email</a>
                <span> | </span>
                <a href="https://twitter.com/phillipyu" className="underline hover:no-underline">twitter</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
