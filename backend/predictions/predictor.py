import os
import json
import torch
import torch.nn as nn
from torchvision import transforms, models
from torchvision.models import efficientnet_b3, EfficientNet_B3_Weights
from PIL import Image

TRAINED_MODELS_DIR = r'C:\Users\dippe\Desktop\University of Botswana\Semester 8\FINALYEARPROJECT\wildlife-ai-system\Wildlife-AI-Monitoring-System-using-Camera-trap-images\models\trained_models'

# ── Model Definitions ────────────────────────────────────────────────────────

class WildlifeResNet(nn.Module):
    def __init__(self, num_species):
        super().__init__()
        backbone = models.resnet50(weights=None)
        in_features = backbone.fc.in_features
        backbone.fc = nn.Identity()
        self.backbone = backbone
        self.species_head = nn.Sequential(
            nn.Dropout(0.4), nn.Linear(in_features, 512),
            nn.ReLU(), nn.Dropout(0.3), nn.Linear(512, num_species),
        )
        self.tod_head = nn.Sequential(
            nn.Dropout(0.3), nn.Linear(in_features, 128),
            nn.ReLU(), nn.Linear(128, 3),
        )
        self.empty_head = nn.Sequential(
            nn.Dropout(0.3), nn.Linear(in_features, 64),
            nn.ReLU(), nn.Linear(64, 1),
        )

    def forward(self, x):
        features = self.backbone(x)
        return {
            'species': self.species_head(features),
            'tod':     self.tod_head(features),
            'empty':   self.empty_head(features).squeeze(1),
        }


class WildlifeEfficientNet(nn.Module):
    def __init__(self, num_species):
        super().__init__()
        backbone = efficientnet_b3(weights=None)
        in_features = backbone.classifier[1].in_features
        backbone.classifier = nn.Identity()
        self.backbone = backbone
        self.species_head = nn.Sequential(
            nn.Dropout(0.4), nn.Linear(in_features, 512),
            nn.ReLU(), nn.Dropout(0.3), nn.Linear(512, num_species),
        )
        self.tod_head = nn.Sequential(
            nn.Dropout(0.3), nn.Linear(in_features, 128),
            nn.ReLU(), nn.Linear(128, 3),
        )
        self.empty_head = nn.Sequential(
            nn.Dropout(0.3), nn.Linear(in_features, 64),
            nn.ReLU(), nn.Linear(64, 1),
        )

    def forward(self, x):
        features = self.backbone(x)
        return {
            'species': self.species_head(features),
            'tod':     self.tod_head(features),
            'empty':   self.empty_head(features).squeeze(1),
        }


# ── Singleton cache ──────────────────────────────────────────────────────────
_models = {}
_label_map = None
_device = None


def get_device():
    global _device
    if _device is None:
        _device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    return _device


def get_label_map():
    global _label_map
    if _label_map is None:
        with open(os.path.join(TRAINED_MODELS_DIR, 'label_map.json'), 'r') as f:
            _label_map = json.load(f)
    return _label_map


def load_model(model_type='resnet'):
    global _models
    if model_type in _models:
        return _models[model_type]

    device    = get_device()
    label_map = get_label_map()
    num_species = len(label_map['species_classes'])

    if model_type == 'resnet':
        checkpoint_file = 'resnet50_serengeti_best.pth'
        model = WildlifeResNet(num_species=num_species).to(device)
    elif model_type == 'efficientnet':
        checkpoint_file = 'efficientnet_b3_serengeti_best.pth'
        model = WildlifeEfficientNet(num_species=num_species).to(device)
    else:
        raise ValueError(f'Unknown model_type: {model_type}')

    checkpoint = torch.load(
        os.path.join(TRAINED_MODELS_DIR, checkpoint_file),
        map_location=device,
        weights_only=False
    )
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    _models[model_type] = model
    return model


# ── Transforms ───────────────────────────────────────────────────────────────
RESNET_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

EFFICIENTNET_TRANSFORM = transforms.Compose([
    transforms.Resize((300, 300)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


# ── Inference ────────────────────────────────────────────────────────────────
def predict(image_path, model_type='resnet'):
    model     = load_model(model_type)
    label_map = get_label_map()
    device    = get_device()

    transform = RESNET_TRANSFORM if model_type == 'resnet' else EFFICIENTNET_TRANSFORM

    image  = Image.open(image_path).convert('RGB')
    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(tensor)

    species_probs = torch.softmax(outputs['species'], dim=1)[0]
    species_idx   = species_probs.argmax().item()
    species_conf  = species_probs[species_idx].item()
    tod_idx       = outputs['tod'].argmax(1).item()
    is_empty      = torch.sigmoid(outputs['empty']).item() > 0.5

    return {
        'species':     label_map['species_classes'][species_idx],
        'confidence':  round(species_conf * 100, 2),
        'time_of_day': label_map['tod_classes'][tod_idx],
        'is_empty':    bool(is_empty),
        'model_used':  model_type,
        'top3': [
            {
                'species':    label_map['species_classes'][i],
                'confidence': round(species_probs[i].item() * 100, 2)
            }
            for i in species_probs.topk(3).indices.tolist()
        ]
    }