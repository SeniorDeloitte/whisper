import "./App.css";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

function App() {
  return (
    <header>
      {/* Show the sign-in and sign-up buttons when the user is signed out */}
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
      {/* Show the user button when the user is signed in */}
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}

export default App;
