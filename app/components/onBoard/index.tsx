import React from 'react';
import WelcomeSlide from './WelcomeSlide';
import UserAgreementSlide from './UserAgreementSlide';
import InfoSlide from './InfoSlide';

export default function OnBoard({
  slideKey = 'welcome',
  getStarted,
}: {
  slideKey: string;
  getStarted: () => void;
}) {
  const SlidesData: { [key: string]: JSX.Element } = {
    welcome: <WelcomeSlide />,
    info: <InfoSlide />,
    userAgreement: <UserAgreementSlide getStarted={getStarted} />,
  };

  return <React.Fragment>{SlidesData[slideKey]}</React.Fragment>;
}
