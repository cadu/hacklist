import { createContext, useContext, useState } from 'react';

const SpinnerContext = createContext()

const SpinnerContextProvider = (props) => {
  const [isSpinnerOn, setIsSpinnerOn] = useState(false)

  return (
    <SpinnerContext.Provider value={{isSpinnerOn, setIsSpinnerOn}}>
        {props.children}
    </SpinnerContext.Provider>
  )
}
const useSpinnerContext = () => useContext(SpinnerContext);

export { useSpinnerContext, SpinnerContext, SpinnerContextProvider }