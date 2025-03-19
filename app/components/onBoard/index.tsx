import React from 'react';
import WelcomeSlide from './WelcomeSlide';
import InfoSlide from './InfoSlide';

export default function OnBoard({
  slideKey = 'welcome',
}: {
  slideKey: string;
}) {
  const SlidesData: { [key: string]: JSX.Element } = {
    welcome: <WelcomeSlide />,
    info: <InfoSlide />,
  };

  return <React.Fragment>{SlidesData[slideKey]}</React.Fragment>;
}
