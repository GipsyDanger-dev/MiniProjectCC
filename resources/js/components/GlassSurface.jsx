import './GlassSurface.css';

const GlassSurface = ({ children, className = '', style = {} }) => {
    return (
        <div className={`glass-surface ${className}`} style={style}>
            <div className="glass-surface__content">
                {children}
            </div>
        </div>
    );
};

export default GlassSurface;
