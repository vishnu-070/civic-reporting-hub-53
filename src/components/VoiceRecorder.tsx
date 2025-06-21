
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTextConverted: (text: string) => void;
}

const VoiceRecorder = ({ onTextConverted }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const convertToText = async () => {
    if (!audioBlob) return;

    setIsConverting(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        // Mock conversion for now - in real app, you'd call your voice-to-text API
        setTimeout(() => {
          const mockText = "Voice message converted to text";
          onTextConverted(mockText);
          setIsConverting(false);
          toast({
            title: "Success",
            description: "Voice message converted to text"
          });
        }, 2000);
      };
    } catch (error) {
      setIsConverting(false);
      toast({
        title: "Error",
        description: "Failed to convert voice to text",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Mic className="h-4 w-4" />
          Record Voice
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          size="sm"
          variant="destructive"
          className="gap-2"
        >
          <Square className="h-4 w-4" />
          Stop Recording
        </Button>
      )}

      {audioBlob && (
        <>
          <Button
            onClick={playRecording}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Play
          </Button>
          <Button
            onClick={convertToText}
            size="sm"
            variant="outline"
            className="gap-2"
            disabled={isConverting}
          >
            <FileText className="h-4 w-4" />
            {isConverting ? 'Converting...' : 'Convert to Text'}
          </Button>
        </>
      )}
    </div>
  );
};

export default VoiceRecorder;
