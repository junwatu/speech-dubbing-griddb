import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, StopCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const AudioRecorder = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const [translatedAudioURL, setTranslatedAudioURL] = useState<string | null>(null);

	const toggleRecording = async () => {
		if (isRecording) {
			// Stop recording
			if (mediaRecorderRef.current) {
				mediaRecorderRef.current.stop();
				setIsRecording(false);
			}
		} else {
			// Start recording
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				mediaRecorderRef.current = new MediaRecorder(stream);

				mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
					audioChunksRef.current.push(event.data);
				};

				mediaRecorderRef.current.onstop = () => {
					const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
					const audioUrl = URL.createObjectURL(audioBlob);
					setAudioURL(audioUrl);
					audioChunksRef.current = [];
					uploadAudio(audioBlob);
					console.log(audioURL);
				};

				mediaRecorderRef.current.start();
				setIsRecording(true);
			} catch (err) {
				console.error('Error accessing microphone:', err);
			}
		}
	};

	const uploadAudio = async (audioBlob: Blob) => {
		const formData = new FormData();
		const fileName = `recorded-audio-${Date.now()}.wav`;
		formData.append('audio', new File([audioBlob], fileName));

		const uploadUrl = `${import.meta.env.VITE_APP_BASE_URL}:${import.meta.env.VITE_PORT}/upload-audio`;
		console.log(uploadUrl)

		try {
			const response = await fetch(uploadUrl, {
				method: 'POST',
				body: formData,
			});
			const data = await response.json();
			setTranslatedAudioURL(data?.filename);
			console.log('Uploaded successfully:', data);
		} catch (error) {
			console.error('Upload failed:', error);
		}
	};

	/**

	const downloadRecording = () => {
		if (audioURL) {
			const link = document.createElement('a');
			link.href = translatedAudioURL || '';
			link.download = translatedAudioURL || '';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};
	*/

	return (
		<Card className="w-full">
			<CardHeader className='text-center'>
				<CardTitle>Speech Dubber</CardTitle>
				<CardDescription>Push to dub your voice</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{isRecording && (
					<Alert variant="destructive">
						<AlertDescription>Recording in progress...</AlertDescription>
					</Alert>
				)}

				<div className="flex justify-center">
					<Button
						onClick={toggleRecording}
						variant={isRecording ? "destructive" : "default"}
						className="w-24 h-24 rounded-full"
					>
						{isRecording ? <StopCircle size={36} /> : <Mic size={36} />}
					</Button>
				</div>

				{translatedAudioURL && (
					<div className="space-y-4">
						<audio
							src={translatedAudioURL}
							controls
							className="w-full"
						/>
						{/**
						<Button
							onClick={downloadRecording}
							className="w-full"
						>
							<Download className="mr-2 h-4 w-4" />
							Download Voice Translation
						</Button>
						*/}

					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default AudioRecorder;