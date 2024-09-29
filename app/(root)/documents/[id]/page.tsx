import CollaborativeRoom from '@/components/CollaborativeRoom';
import { Editor } from '@/components/editor/Editor'
import Header from '@/components/Header'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import React from 'react'

const Document = () => {
  return (
    <div>
      <main className='flex w-full flex-col items-center'>
        <CollaborativeRoom />
      </main>
    </div>
  );
}

export default Document