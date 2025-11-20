import { useState } from 'react';
import { Route, Switch } from 'wouter';
import HomePage from './pages/HomePage';
import FortunePage from './pages/FortunePage';
import ImagePage from './pages/ImagePage';
import EntertainmentPage from './pages/EntertainmentPage';
import HealthPage from './pages/HealthPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import MyResultsPage from './pages/MyResultsPage';
import BuyCreditsPage from './pages/BuyCreditsPage';
import HelpPage from './pages/HelpPage';
import KakaoCallback from './pages/KakaoCallback';
import AdminPage from './pages/AdminPage';
import CreditPurchasePage from './pages/CreditPurchasePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailPage from './pages/PaymentFailPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AnnouncementBanner from './components/AnnouncementBanner';

// Service Pages - Fortune
import SajuPage from './pages/services/SajuPage';
import DeepSaju2026Page from './pages/services/DeepSaju2026Page';
import FaceReadingPage from './pages/services/FaceReadingPage';
import PalmistryPage from './pages/services/PalmistryPage';
import HoroscopePage from './pages/services/HoroscopePage';
import ZodiacPage from './pages/services/ZodiacPage';
import LoveCompatibilityPage from './pages/services/LoveCompatibilityPage';
import NameCompatibilityPage from './pages/services/NameCompatibilityPage';
import MarriageCompatibilityPage from './pages/services/MarriageCompatibilityPage';

// Service Pages - Personality
import MBTIAnalysisPage from './pages/services/MBTIAnalysisPage';
import EnneagramTestPage from './pages/services/EnneagramTestPage';
import BigFiveTestPage from './pages/services/BigFiveTestPage';
import StressTestPage from './pages/services/StressTestPage';
import GeumjjokiTestPage from './pages/services/GeumjjokiTestPage';

// Service Pages - Image
import ProfileGeneratorPage from './pages/services/ProfileGeneratorPage';
import CaricaturePage from './pages/services/CaricaturePage';
import IdPhotoPage from './pages/services/IdPhotoPage';
import AgeTransformPage from './pages/services/AgeTransformPage';
import GenderSwapPage from './pages/services/GenderSwapPage';
import ColorizationPage from './pages/services/ColorizationPage';
import BackgroundRemovalPage from './pages/services/BackgroundRemovalPage';
import HairstylePage from './pages/services/HairstylePage';
import TattooPage from './pages/services/TattooPage';
import LookalikePage from './pages/services/LookalikePage';
import PetSoulmatePage from './pages/services/PetSoulmatePage';
import BabyFacePage from './pages/services/BabyFacePage';
import PersonalColorPage from './pages/services/PersonalColorPage';

// Service Pages - Health
import BodyAnalysisPage from './pages/services/BodyAnalysisPage';
import SkinAnalysisPage from './pages/services/SkinAnalysisPage';
import BMICalculatorPage from './pages/services/BMICalculatorPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-background text-foreground">
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      {/* Important Announcements Banner */}
      <AnnouncementBanner />

      <div className="flex flex-1 w-full">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/signup" component={SignupPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/verify-email" component={VerifyEmailPage} />
            <Route path="/oauth/kakao/callback" component={KakaoCallback} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/my-results" component={MyResultsPage} />
            <Route path="/buy-credits" component={BuyCreditsPage} />
            <Route path="/credit-purchase" component={CreditPurchasePage} />
            <Route path="/payment/success" component={PaymentSuccessPage} />
            <Route path="/payment/fail" component={PaymentFailPage} />
            <Route path="/help" component={HelpPage} />
            <Route path="/admin" component={AdminPage} />

            {/* Category Pages */}
            <Route path="/fortune" component={FortunePage} />
            <Route path="/image" component={ImagePage} />
            <Route path="/entertainment" component={EntertainmentPage} />
            <Route path="/health" component={HealthPage} />

            {/* Service Detail Pages - Fortune */}
            <Route path="/services/saju" component={SajuPage} />
            <Route path="/services/deep-saju-2026" component={DeepSaju2026Page} />
            <Route path="/services/face-reading" component={FaceReadingPage} />
            <Route path="/services/palmistry" component={PalmistryPage} />
            <Route path="/services/horoscope" component={HoroscopePage} />
            <Route path="/services/zodiac" component={ZodiacPage} />
            <Route path="/services/love-compatibility" component={LoveCompatibilityPage} />
            <Route path="/services/name-compatibility" component={NameCompatibilityPage} />
            <Route path="/services/marriage-compatibility" component={MarriageCompatibilityPage} />

            {/* Service Detail Pages - Personality */}
            <Route path="/services/mbti-analysis" component={MBTIAnalysisPage} />
            <Route path="/services/enneagram-test" component={EnneagramTestPage} />
            <Route path="/services/bigfive-test" component={BigFiveTestPage} />
            <Route path="/services/stress-test" component={StressTestPage} />
            <Route path="/services/geumjjoki-test" component={GeumjjokiTestPage} />

            {/* Service Detail Pages - Image */}
            <Route path="/services/profile-generator" component={ProfileGeneratorPage} />
            <Route path="/services/caricature" component={CaricaturePage} />
            <Route path="/services/id-photo" component={IdPhotoPage} />
            <Route path="/services/age-transform" component={AgeTransformPage} />
            <Route path="/services/gender-swap" component={GenderSwapPage} />
            <Route path="/services/colorization" component={ColorizationPage} />
            <Route path="/services/background-removal" component={BackgroundRemovalPage} />
            <Route path="/services/hairstyle" component={HairstylePage} />
            <Route path="/services/tattoo" component={TattooPage} />
            <Route path="/services/lookalike" component={LookalikePage} />
            <Route path="/services/pet-soulmate" component={PetSoulmatePage} />
            <Route path="/services/baby-face" component={BabyFacePage} />
            <Route path="/services/personal-color" component={PersonalColorPage} />

            {/* Service Detail Pages - Health */}
            <Route path="/services/body-analysis" component={BodyAnalysisPage} />
            <Route path="/services/skin-analysis" component={SkinAnalysisPage} />
            <Route path="/services/bmi-calculator" component={BMICalculatorPage} />

            <Route path="/:rest*">
              {() => (
                <div className="flex items-center justify-center h-screen">
                  <h1 className="text-2xl font-bold text-white">404 - Page Not Found</h1>
                </div>
              )}
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

export default App;
