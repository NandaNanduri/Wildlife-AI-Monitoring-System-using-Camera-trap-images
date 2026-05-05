import os
import io
import json
import zipfile
import threading
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import matplotlib
matplotlib.use('Agg')  # non-interactive backend for Django
import matplotlib.pyplot as plt
from torchvision import transforms, models
from torchvision.models import efficientnet_b3, EfficientNet_B3_Weights, ResNet50_Weights
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from PIL import Image
from django.utils import timezone
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns

TRAINED_MODELS_DIR = os.path.normpath(os.path.join(
    os.path.dirname(__file__), '..', '..', 'models', 'trained_models'
))


# ── Model Definitions ────────────────────────────────────────────────────────

class WildlifeResNet(nn.Module):
    def __init__(self, num_species):
        super().__init__()
        backbone = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)
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
        backbone = efficientnet_b3(weights=EfficientNet_B3_Weights.DEFAULT)
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


# ── Focal Loss ───────────────────────────────────────────────────────────────

class FocalLoss(nn.Module):
    def __init__(self, gamma=2.0):
        super().__init__()
        self.gamma = gamma

    def forward(self, inputs, targets):
        ce = nn.functional.cross_entropy(inputs, targets, reduction='none')
        pt = torch.exp(-ce)
        return (((1 - pt) ** self.gamma) * ce).mean()


# ── Dataset ──────────────────────────────────────────────────────────────────

class ZipWildlifeDataset(Dataset):
    def __init__(self, records, zip_bytes, transform=None):
        self.records   = records
        self.zip_bytes = zip_bytes
        self.transform = transform

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        row = self.records[idx]
        try:
            with zipfile.ZipFile(io.BytesIO(self.zip_bytes)) as zf:
                with zf.open(row['zip_path']) as f:
                    image = Image.open(f).convert('RGB')
        except Exception:
            image = Image.new('RGB', (224, 224), (0, 0, 0))
        if self.transform:
            image = self.transform(image)
        return {
            'image':         image,
            'species_label': torch.tensor(row['species_label'], dtype=torch.long),
            'tod_label':     torch.tensor(0,                    dtype=torch.long),
            'is_empty':      torch.tensor(float(row['species'] == 'empty'), dtype=torch.float),
        }


# ── Graph Generation ─────────────────────────────────────────────────────────

def save_loss_curve(train_losses, val_losses, val_accs, output_path):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    fig.patch.set_facecolor('#0a1410')
    for ax in (ax1, ax2):
        ax.set_facecolor('#0f1f17')
        ax.tick_params(colors='#7aab8a')
        ax.xaxis.label.set_color('#7aab8a')
        ax.yaxis.label.set_color('#7aab8a')
        ax.title.set_color('#95d5b2')
        for spine in ax.spines.values():
            spine.set_edgecolor('#1e3328')

    epochs = range(1, len(train_losses) + 1)
    ax1.plot(epochs, train_losses, color='#52b788', linewidth=2, label='Train Loss')
    ax1.plot(epochs, val_losses,   color='#95d5b2', linewidth=2, linestyle='--', label='Val Loss')
    ax1.set_title('Training & Validation Loss')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Loss')
    ax1.legend(facecolor='#1a2e22', labelcolor='#b7d9c2')
    ax1.grid(True, color='#1e3328', alpha=0.5)

    ax2.plot(epochs, val_accs, color='#52b788', linewidth=2, label='Val Species Acc')
    ax2.set_title('Validation Accuracy')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Accuracy')
    ax2.set_ylim(0, 1)
    ax2.legend(facecolor='#1a2e22', labelcolor='#b7d9c2')
    ax2.grid(True, color='#1e3328', alpha=0.5)

    plt.tight_layout()
    plt.savefig(output_path, dpi=100, bbox_inches='tight', facecolor='#0a1410')
    plt.close()


def save_confusion_matrix(all_preds, all_labels, species_classes, output_path):
    cm = confusion_matrix(all_labels, all_preds)
    fig, ax = plt.subplots(figsize=(max(8, len(species_classes)), max(6, len(species_classes) - 1)))
    fig.patch.set_facecolor('#0a1410')
    ax.set_facecolor('#0f1f17')

    sns.heatmap(
        cm, annot=True, fmt='d',
        xticklabels=species_classes,
        yticklabels=species_classes,
        cmap='Greens', ax=ax,
        linewidths=0.5, linecolor='#1e3328',
    )
    ax.set_title('Confusion Matrix', color='#95d5b2', pad=12)
    ax.set_xlabel('Predicted', color='#7aab8a')
    ax.set_ylabel('True', color='#7aab8a')
    ax.tick_params(colors='#7aab8a', rotation=45)
    plt.xticks(rotation=45, ha='right', color='#7aab8a')
    plt.yticks(rotation=0, color='#7aab8a')

    plt.tight_layout()
    plt.savefig(output_path, dpi=100, bbox_inches='tight', facecolor='#0a1410')
    plt.close()


# ── Main Training Function ───────────────────────────────────────────────────

def run_training(job_id):
    from training.models import TrainingJob
    from model_management.models import MLModel, TrainingConfig, PerformanceMetric, ModelArtifact

    job = TrainingJob.objects.get(id=job_id)
    job.status = 'running'
    job.save()

    def log(msg):
        job.refresh_from_db()
        job.log += msg + '\n'
        job.save(update_fields=['log'])

    try:
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        log(f'Device: {device}')

        # ── Read ZIP ──────────────────────────────────────────────────────────
        zip_path  = job.dataset_zip.path
        zip_bytes = open(zip_path, 'rb').read()
        log(f'Dataset ZIP loaded: {os.path.basename(zip_path)}')

        records = []
        species_set = set()
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
            for name in zf.namelist():
                parts = name.split('/')
                if len(parts) == 2 and parts[1]:
                    species = parts[0].lower()
                    species_set.add(species)
                    records.append({'zip_path': name, 'species': species})

        species_classes = sorted(species_set)
        species_to_idx  = {s: i for i, s in enumerate(species_classes)}
        for r in records:
            r['species_label'] = species_to_idx[r['species']]

        log(f'Species found ({len(species_classes)}): {species_classes}')
        log(f'Total images: {len(records)}')

        # ── Split ─────────────────────────────────────────────────────────────
        labels = [r['species_label'] for r in records]
        train_rec, val_rec = train_test_split(
            records, test_size=job.val_split,
            stratify=labels, random_state=42
        )
        log(f'Train: {len(train_rec)} | Val: {len(val_rec)}')

        # ── Transforms ────────────────────────────────────────────────────────
        img_size = 224 if job.model_architecture == 'resnet' else 300
        train_tf = transforms.Compose([
            transforms.Resize((img_size, img_size)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(20),
            transforms.ColorJitter(brightness=0.4, contrast=0.4, saturation=0.3),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
        val_tf = transforms.Compose([
            transforms.Resize((img_size, img_size)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])

        train_ds = ZipWildlifeDataset(train_rec, zip_bytes, train_tf)
        val_ds   = ZipWildlifeDataset(val_rec,   zip_bytes, val_tf)

        counts  = np.bincount([r['species_label'] for r in train_rec], minlength=len(species_classes))
        weights = 1.0 / np.maximum(counts, 1)
        sample_weights = [weights[r['species_label']] for r in train_rec]
        sampler = WeightedRandomSampler(sample_weights, len(sample_weights), replacement=True)

        train_loader = DataLoader(train_ds, batch_size=job.batch_size, sampler=sampler,  num_workers=0)
        val_loader   = DataLoader(val_ds,   batch_size=job.batch_size, shuffle=False,    num_workers=0)

        # ── Model ─────────────────────────────────────────────────────────────
        num_species = len(species_classes)
        if job.model_architecture == 'resnet':
            model = WildlifeResNet(num_species).to(device)
        else:
            model = WildlifeEfficientNet(num_species).to(device)

        for param in model.backbone.parameters():
            param.requires_grad = False
        log(f'Backbone frozen for {job.warmup_epochs} warmup epochs.')

        species_loss = FocalLoss(gamma=job.focal_loss_gamma)
        tod_loss     = nn.CrossEntropyLoss()
        empty_loss   = nn.BCEWithLogitsLoss()
        optimizer    = optim.AdamW(
            filter(lambda p: p.requires_grad, model.parameters()),
            lr=job.learning_rate, weight_decay=1e-4
        )
        scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=job.epochs)

        # ── Training loop ─────────────────────────────────────────────────────
        best_acc    = 0.0
        arch_name   = 'resnet50' if job.model_architecture == 'resnet' else 'efficientnet_b3'
        output_pth  = os.path.join(TRAINED_MODELS_DIR, f'{arch_name}_job{job.id}_best.pth')

        train_losses = []
        val_losses   = []
        val_accs     = []

        for epoch in range(1, job.epochs + 1):
            # ── Check cancellation ──────────────────────────
            job.refresh_from_db()
            if job.is_cancelled:
                log('[CANCELLED] Training stopped by administrator.')
                job.status = 'failed'
                job.save(update_fields=['status'])
                return
            # ───────────────────────────────────────────────


            if epoch == job.warmup_epochs + 1:
                for param in model.backbone.parameters():
                    param.requires_grad = True
                optimizer = optim.AdamW(model.parameters(), lr=job.learning_rate, weight_decay=1e-4)
                log('Backbone unfrozen — full fine-tuning started.')

            model.train()
            train_loss = 0.0
            for batch in train_loader:
                imgs       = batch['image'].to(device)
                sp_labels  = batch['species_label'].to(device)
                tod_labels = batch['tod_label'].to(device)
                empty_lbl  = batch['is_empty'].to(device)
                optimizer.zero_grad()
                out  = model(imgs)
                loss = (species_loss(out['species'], sp_labels) +
                        0.3 * tod_loss(out['tod'], tod_labels) +
                        0.5 * empty_loss(out['empty'], empty_lbl))
                loss.backward()
                optimizer.step()
                train_loss += loss.item()

            model.eval()
            correct = total = 0
            val_loss = 0.0
            with torch.no_grad():
                for batch in val_loader:
                    imgs       = batch['image'].to(device)
                    sp_labels  = batch['species_label'].to(device)
                    tod_labels = batch['tod_label'].to(device)
                    empty_lbl  = batch['is_empty'].to(device)
                    out  = model(imgs)
                    loss = (species_loss(out['species'], sp_labels) +
                            0.3 * tod_loss(out['tod'], tod_labels) +
                            0.5 * empty_loss(out['empty'], empty_lbl))
                    val_loss += loss.item()
                    preds     = out['species'].argmax(1)
                    correct  += (preds == sp_labels).sum().item()
                    total    += sp_labels.size(0)

            val_acc   = correct / total
            avg_train = train_loss / len(train_loader)
            avg_val   = val_loss   / len(val_loader)
            scheduler.step()

            train_losses.append(avg_train)
            val_losses.append(avg_val)
            val_accs.append(val_acc)

            epoch_log = (f'Epoch {epoch:02d}/{job.epochs} | '
                         f'Train Loss: {avg_train:.4f} | '
                         f'Val Loss: {avg_val:.4f} | '
                         f'Val Acc: {val_acc:.3f}')

            if val_acc > best_acc:
                best_acc = val_acc
                torch.save({
                    'epoch':                epoch,
                    'model_state_dict':     model.state_dict(),
                    'optimizer_state_dict': optimizer.state_dict(),
                    'val_acc':              best_acc,
                    'species_classes':      species_classes,
                }, output_pth)
                epoch_log += ' -> Best model saved'

            log(epoch_log)

        # ── Generate loss curve ───────────────────────────────────────────────
        log('Generating training curves...')
        curves_filename = f'{arch_name}_job{job.id}_training_curves.png'
        curves_path     = os.path.join(TRAINED_MODELS_DIR, curves_filename)
        save_loss_curve(train_losses, val_losses, val_accs, curves_path)
        log(f'Training curves saved: {curves_filename}')

        # ── Generate confusion matrix ─────────────────────────────────────────
        log('Generating confusion matrix...')
        model.eval()
        all_preds  = []
        all_labels = []
        with torch.no_grad():
            for batch in val_loader:
                imgs      = batch['image'].to(device)
                sp_labels = batch['species_label'].to(device)
                out       = model(imgs)
                preds     = out['species'].argmax(1)
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(sp_labels.cpu().numpy())

        cm_filename = f'{arch_name}_job{job.id}_confusion_matrix.png'
        cm_path     = os.path.join(TRAINED_MODELS_DIR, cm_filename)
        save_confusion_matrix(all_preds, all_labels, species_classes, cm_path)
        log(f'Confusion matrix saved: {cm_filename}')

        # ── Compute per-class metrics ─────────────────────────────────────────
        report = classification_report(
            all_labels, all_preds,
            target_names=species_classes,
            output_dict=True,
            zero_division=0
        )
        per_class = {
            cls: {
                'precision': round(report[cls]['precision'], 4),
                'recall':    round(report[cls]['recall'],    4),
                'f1':        round(report[cls]['f1-score'],  4),
                'support':   int(report[cls]['support']),
            }
            for cls in species_classes
        }

        # ── Save label map ────────────────────────────────────────────────────
        label_map_path = os.path.join(TRAINED_MODELS_DIR, f'label_map_job{job.id}.json')
        with open(label_map_path, 'w') as f:
            json.dump({
                'species_classes': species_classes,
                'tod_classes':     ['day', 'night', 'unknown'],
            }, f)

        # ── Register in MLModel ───────────────────────────────────────────────
        arch_display = 'ResNet50' if job.model_architecture == 'resnet' else 'EfficientNetB3'
        ml_model = MLModel.objects.create(
            name=f'{arch_display} (Job #{job.id})',
            model_type='CNN - Residual Network' if job.model_architecture == 'resnet' else 'CNN - Efficient Scaling Network',
            version=f'job{job.id}',
            date_trained=timezone.now().date(),
            dataset_used=os.path.basename(zip_path),
            num_classes=num_species,
            total_training_images=len(train_rec),
            total_validation_images=len(val_rec),
            total_test_images=len(val_rec),
            status='inactive',
            weight_file=os.path.basename(output_pth),
            notes=job.notes or f'Trained via Training Console. Best val acc: {best_acc:.3f}',
        )

        TrainingConfig.objects.create(
            model=ml_model,
            epochs=job.epochs,
            batch_size=job.batch_size,
            learning_rate=job.learning_rate,
            optimizer='AdamW (weight_decay=1e-4)',
            loss_function=f'Focal Loss (gamma={job.focal_loss_gamma}) for species | CrossEntropyLoss for ToD | BCEWithLogitsLoss for empty',
            train_split=round(1 - job.val_split, 2),
            val_split=job.val_split,
            test_split=job.val_split,
            augmentation_used='Random horizontal flip, random rotation, color jitter, normalization',
            hardware=str(device),
            training_duration='Completed via Training Console',
        )

        PerformanceMetric.objects.create(
            model=ml_model,
            accuracy=round(report['accuracy'], 4),
            macro_precision=round(report['macro avg']['precision'], 4),
            macro_recall=round(report['macro avg']['recall'],    4),
            macro_f1=round(report['macro avg']['f1-score'],  4),
            weighted_precision=round(report['weighted avg']['precision'], 4),
            weighted_recall=round(report['weighted avg']['recall'],    4),
            weighted_f1=round(report['weighted avg']['f1-score'],  4),
            per_class_metrics=per_class,
        )

        # Register artifacts
        for artifact_type, filename, label in [
            ('confusion_matrix', cm_filename,     f'{arch_display} (Job #{job.id}) Confusion Matrix'),
            ('training_curves',  curves_filename, f'{arch_display} (Job #{job.id}) Training Curves'),
        ]:
            ModelArtifact.objects.create(
                model=ml_model,
                artifact_type=artifact_type,
                image_path=filename,
                label=label,
            )

        job.status       = 'completed'
        job.output_pth   = output_pth
        job.completed_at = timezone.now()
        job.save()

        log(f'Training complete! Best val acc: {best_acc:.3f}')
        log(f'Model saved: {os.path.basename(output_pth)}')
        log(f'Registered in Model Registry as: {ml_model.name}')

    except Exception as e:
        import traceback
        job.status = 'failed'
        job.log   += f'\nERROR: {e}\n{traceback.format_exc()}'
        job.save()


def start_training_thread(job_id):
    t = threading.Thread(target=run_training, args=(job_id,), daemon=True)
    t.start()