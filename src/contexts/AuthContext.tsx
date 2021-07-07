import { createContext, ReactNode, useEffect, useState } from "react";
import { auth, firebase} from "../services/firebase";

type User = {
    id: string;
    name: string;
    avatar: string;
}
  
type AuthContextType = {
    user: User | undefined,
    signInWithGoogle: () => Promise<void>; //Toda função async devolve uma promise
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType); //type object



export function AuthContextProvider(props: AuthContextProviderProps) {
  const [user, setUser] = useState<User>(); 

  useEffect(() => {
    //Quando a função app for renderizada, essa funçãovai no firebase e fica ouvindo se ja tinha esse usuario logado e não apaga os dados
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {//Se usuario for encontrado
          const { displayName, photoURL, uid } = user;
  
          if (!displayName || !photoURL || !uid) { 
            throw new Error('Missing information from Google Account');
          }
  
          setUser({
            id: uid,
            name: displayName,
            avatar: photoURL
          })
      }
    })
    //Função que descadastra de todos eventListeners
    return () => {
      unsubscribe();
    }
  }, []) 

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await auth.signInWithPopup(provider);

      if (result.user) { //Se usuario for encontrado, quero alguns dados 
        const { displayName, photoURL, uid } = result.user;

        if (!displayName || !photoURL || !uid) { //Se usuario não tiver nome ou foto
          throw new Error('Missing information from Google Account');
        }

        //Se ele tem o nome e a foto
        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL
        })
      }
  }
    return (
        <AuthContext.Provider value={{ user, signInWithGoogle }}>
            {props.children}
        </AuthContext.Provider>
    );
}