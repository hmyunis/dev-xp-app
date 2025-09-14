import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Download, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface ReportCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportCardUrl: string;
    studentName: string;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
    isOpen,
    onClose,
    reportCardUrl,
    studentName,
}) => {
    const [zoom, setZoom] = useState(1);

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = reportCardUrl;
        link.download = `${studentName}-report-card.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.2, 0.5));
    };

    const resetZoom = () => {
        setZoom(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold">
                            Report Card - {studentName}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleZoomOut}
                                disabled={zoom <= 0.5}
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={resetZoom}>
                                {Math.round(zoom * 100)}%
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleZoomIn}
                                disabled={zoom >= 3}
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownload}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
                <div className="p-6 pt-0 overflow-auto max-h-[calc(90vh-120px)]">
                    <div className="flex justify-center">
                        <img
                            src={reportCardUrl}
                            alt={`${studentName}'s Report Card`}
                            className="max-w-full h-auto shadow-lg rounded-lg"
                            style={{
                                transform: `scale(${zoom})`,
                                transformOrigin: "center top",
                            }}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
