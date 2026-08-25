CREATE TABLE anatomy_node (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    parent_id VARCHAR(100),
    code VARCHAR(100) NOT NULL UNIQUE,
    name_zh VARCHAR(120) NOT NULL,
    name_en VARCHAR(120) NOT NULL,
    level_no INT NOT NULL,
    view_name VARCHAR(16) NOT NULL,
    side VARCHAR(16) NOT NULL,
    gender_scope VARCHAR(16) NOT NULL DEFAULT 'ALL',
    asset_path VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_anatomy_parent FOREIGN KEY (parent_id) REFERENCES anatomy_node(id)
);

CREATE INDEX idx_anatomy_parent_sort ON anatomy_node (parent_id, sort_order);
CREATE INDEX idx_anatomy_enabled ON anatomy_node (enabled, level_no);

INSERT INTO anatomy_node (id, parent_id, code, name_zh, name_en, level_no, view_name, side, sort_order) VALUES
('region.neck', NULL, 'region.neck', '颈部', 'Neck', 1, 'both', 'midline', 10),
('region.shoulders', NULL, 'region.shoulders', '肩部', 'Shoulders', 1, 'both', 'bilateral', 20),
('region.chest', NULL, 'region.chest', '胸部', 'Chest', 1, 'front', 'bilateral', 30),
('region.arms', NULL, 'region.arms', '手臂', 'Arms', 1, 'both', 'bilateral', 40),
('region.core', NULL, 'region.core', '核心', 'Core', 1, 'both', 'midline', 50),
('region.back', NULL, 'region.back', '背部与腰部', 'Back and Lower Back', 1, 'back', 'bilateral', 60),
('region.glutes', NULL, 'region.glutes', '臀部', 'Glutes', 1, 'back', 'bilateral', 70),
('region.legs', NULL, 'region.legs', '大腿', 'Thighs', 1, 'both', 'bilateral', 80),
('region.lower-leg', NULL, 'region.lower-leg', '小腿与足部', 'Lower Legs and Feet', 1, 'both', 'bilateral', 90);

INSERT INTO anatomy_node (id, parent_id, code, name_zh, name_en, level_no, view_name, side, sort_order) VALUES
('muscle.neck', 'region.neck', 'muscle.neck', '颈部肌群', 'Neck Muscles', 2, 'both', 'bilateral', 10),
('muscle.deltoid', 'region.shoulders', 'muscle.deltoid', '三角肌', 'Deltoid', 2, 'both', 'bilateral', 10),
('muscle.deltoid.anterior', 'muscle.deltoid', 'muscle.deltoid.anterior', '三角肌前束', 'Anterior Deltoid', 3, 'front', 'bilateral', 11),
('muscle.deltoid.middle', 'muscle.deltoid', 'muscle.deltoid.middle', '三角肌中束', 'Middle Deltoid', 3, 'front', 'bilateral', 12),
('muscle.deltoid.posterior', 'muscle.deltoid', 'muscle.deltoid.posterior', '三角肌后束', 'Posterior Deltoid', 3, 'back', 'bilateral', 13),
('muscle.pectoralis-major', 'region.chest', 'muscle.pectoralis-major', '胸大肌', 'Pectoralis Major', 2, 'front', 'bilateral', 10),
('muscle.pectoralis-major.upper', 'muscle.pectoralis-major', 'muscle.pectoralis-major.upper', '上胸', 'Upper Pectoralis Major', 3, 'front', 'bilateral', 11),
('muscle.pectoralis-major.lower', 'muscle.pectoralis-major', 'muscle.pectoralis-major.lower', '下胸', 'Lower Pectoralis Major', 3, 'front', 'bilateral', 12),
('muscle.serratus-anterior', 'region.chest', 'muscle.serratus-anterior', '前锯肌', 'Serratus Anterior', 2, 'front', 'bilateral', 20),
('muscle.biceps-brachii', 'region.arms', 'muscle.biceps-brachii', '肱二头肌', 'Biceps Brachii', 2, 'front', 'bilateral', 10),
('muscle.triceps-brachii', 'region.arms', 'muscle.triceps-brachii', '肱三头肌', 'Triceps Brachii', 2, 'back', 'bilateral', 20),
('muscle.forearm', 'region.arms', 'muscle.forearm', '前臂肌群', 'Forearm Muscles', 2, 'both', 'bilateral', 30),
('muscle.rectus-abdominis', 'region.core', 'muscle.rectus-abdominis', '腹直肌', 'Rectus Abdominis', 2, 'front', 'midline', 10),
('muscle.external-oblique', 'region.core', 'muscle.external-oblique', '腹外斜肌', 'External Oblique', 2, 'front', 'bilateral', 20),
('muscle.latissimus-dorsi', 'region.back', 'muscle.latissimus-dorsi', '背阔肌', 'Latissimus Dorsi', 2, 'back', 'bilateral', 10),
('muscle.trapezius', 'region.back', 'muscle.trapezius', '斜方肌', 'Trapezius', 2, 'back', 'bilateral', 20),
('muscle.trapezius.upper', 'muscle.trapezius', 'muscle.trapezius.upper', '斜方肌上束', 'Upper Trapezius', 3, 'back', 'bilateral', 21),
('muscle.trapezius.middle', 'muscle.trapezius', 'muscle.trapezius.middle', '斜方肌中束', 'Middle Trapezius', 3, 'back', 'bilateral', 22),
('muscle.trapezius.lower', 'muscle.trapezius', 'muscle.trapezius.lower', '斜方肌下束', 'Lower Trapezius', 3, 'back', 'bilateral', 23),
('muscle.erector-spinae', 'region.back', 'muscle.erector-spinae', '竖脊肌', 'Erector Spinae', 2, 'back', 'bilateral', 30),
('muscle.gluteus-maximus', 'region.glutes', 'muscle.gluteus-maximus', '臀大肌', 'Gluteus Maximus', 2, 'back', 'bilateral', 10),
('muscle.gluteus-medius', 'region.glutes', 'muscle.gluteus-medius', '臀中肌', 'Gluteus Medius', 2, 'back', 'bilateral', 20),
('muscle.quadriceps', 'region.legs', 'muscle.quadriceps', '股四头肌', 'Quadriceps', 2, 'front', 'bilateral', 10),
('muscle.hamstrings', 'region.legs', 'muscle.hamstrings', '腘绳肌', 'Hamstrings', 2, 'back', 'bilateral', 20),
('muscle.adductors', 'region.legs', 'muscle.adductors', '大腿内收肌', 'Hip Adductors', 2, 'front', 'bilateral', 30),
('muscle.tibialis-anterior', 'region.lower-leg', 'muscle.tibialis-anterior', '胫骨前肌', 'Tibialis Anterior', 2, 'front', 'bilateral', 10),
('muscle.gastrocnemius', 'region.lower-leg', 'muscle.gastrocnemius', '腓肠肌', 'Gastrocnemius', 2, 'back', 'bilateral', 20),
('muscle.soleus', 'region.lower-leg', 'muscle.soleus', '比目鱼肌', 'Soleus', 2, 'back', 'bilateral', 30);
