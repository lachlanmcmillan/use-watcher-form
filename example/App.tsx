import { useState } from 'react';
import { DarkToggle } from './components/DarkToggle/DarkToggle';
import { TabBar } from './components/TabBar/TabBar';
import { Simple } from './views/Simple/Simple';
import classes from './App.module.css';

const tabs: { label: string; value: string }[] = [
  { label: 'Simple Forms', value: 'simple' },
];

export const App = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]['value']>('simple');

  return (
    <div>
      <DarkToggle />

      <h1>useWatcherForm</h1>
      <p className={classes.appDescription}>
        A powerful, uncontrolled form library built on top of useWatcherMap.
      </p>

      {/* <TabBar tabs={tabs} selectedTab={tab} onChange={value => setTab(value)} />

      <div className={classes.tabContent}>
        {tab === 'simple' && <Simple />}
      </div> */}
      <Simple />
    </div>
  );
};
