import { SVGAttributes, useState, useEffect } from 'react';

interface ApplicationLogoProps extends SVGAttributes<SVGElement> {
    systemSettings?: {
        system_image?: string;
        system_name?: string;
    };
}

export default function ApplicationLogo({ systemSettings, ...props }: ApplicationLogoProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Reset state when image changes
    useEffect(() => {
        setImageError(false);
        setImageLoaded(false);
    }, [systemSettings?.system_image]);

    const logoSrc = systemSettings?.system_image && !imageError
        ? `/imgs/system_image/${systemSettings.system_image}`
        : '/imgs/Ashli.png';

    return (
        <div
            style={{
                width: props.width || '100%',
                height: props.height || 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            className={props.className}
        >
            <img
                src={logoSrc}
                alt={systemSettings?.system_name || 'System Logo'}
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
            />
        </div>
    );
}
