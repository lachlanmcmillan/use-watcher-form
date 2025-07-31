import { useState } from 'react';
import { DarkToggle } from './components/DarkToggle/DarkToggle';
import { TabBar } from './components/TabBar/TabBar';
import { Simple } from './views/Simple/Simple';
import { AdvancedValidation } from './views/AdvancedValidation/AdvancedValidation';
import { FormStateManagement } from './views/FormStateManagement/FormStateManagement';
import { NestedData } from './views/NestedData/NestedData';
import { Performance } from './views/Performance/Performance';
import classes from './App.module.css';

const tabs: { label: string; value: string }[] = [
  { label: 'Simple Forms', value: 'simple' },
  { label: 'Advanced Validation', value: 'validation' },
  { label: 'Form State', value: 'state' },
  { label: 'Nested Data', value: 'nested' },
  { label: 'Performance', value: 'performance' },
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

      <TabBar tabs={tabs} selectedTab={tab} onChange={value => setTab(value)} />

      <div className={classes.tabContent}>
        {tab === 'simple' && <Simple />}
        {tab === 'validation' && <AdvancedValidation />}
        {tab === 'state' && <FormStateManagement />}
        {tab === 'nested' && <NestedData />}
        {tab === 'performance' && <Performance />}
      </div>
    </div>
  );
};
