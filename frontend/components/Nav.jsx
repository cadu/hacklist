import React from 'react'
import { MdModeNight } from 'react-icons/md';
import { WiDaySunny } from 'react-icons/wi';

const Nav = (props) => {
  return (
    <nav className="flex flex-row justify-between items-center content-evenly">
      <h1 className="text-4xl md:text-5xl font-bold"><span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-green-600">HackList</span></h1>
      <div className="switchTheme flex bg-opacity-40 bg-slate-200 dark:bg-slate-500 p-1 rounded-md text-xs md:text-sm">
        <a className="transition ease-in-out duration-300 rounded-md text-slate-600 dark:text-slate-100 dark:bg-slate-600 p-1 md:p-2" href="#_" onClick={props.toggleTheme}><MdModeNight /></a>
        <a className="transition ease-in-out duration-300 rounded-md text-slate-100 bg-slate-400 dark:bg-transparent dark:text-slate-900 p-1 md:p-2" href="#_" onClick={props.toggleTheme}><WiDaySunny /></a>
      </div>
    </nav>
  )
}

export default Nav