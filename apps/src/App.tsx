import AudioRecorder from './AudioRecorder';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <AudioRecorder />
      </div>
    </div>
  );
};

export default Home;