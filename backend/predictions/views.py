from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from images.models import Image as ImageModel
from .models import InsightSettings
from predictions.models import Prediction, Species, AIModel
from predictions.predictor import predict
from model_management.models import MLModel
from collections import defaultdict
from PIL import Image as PILImage
from PIL.ExifTags import TAGS
from datetime import datetime
import pytz


def extract_exif_datetime(filepath):
    """Extract date taken from image EXIF metadata."""
    try:
        img = PILImage.open(filepath)
        exif_data = img._getexif()
        if not exif_data:
            return None
        for tag_id, value in exif_data.items():
            tag = TAGS.get(tag_id, tag_id)
            if tag == 'DateTimeOriginal' or tag == 'DateTime':
                return datetime.strptime(value, '%Y:%m:%d %H:%M:%S')
    except Exception:
        return None
    return None


class UploadAndPredictView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request):
        files = request.FILES.getlist('files')
        if not files:
            return Response({'error': 'No files provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            deployed = MLModel.objects.get(status='deployed')
        except MLModel.DoesNotExist:
            return Response(
                {'error': 'No model is currently deployed. Please contact the administrator.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        weight = deployed.weight_file.lower()
        if 'resnet' in weight:
            model_type = 'resnet'
        elif 'efficientnet' in weight:
            model_type = 'efficientnet'
        else:
            return Response(
                {'error': 'Deployed model type is not recognised by the prediction engine.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        model_display = deployed.name
        ai_model, _ = AIModel.objects.get_or_create(
            model_name=model_display,
            defaults={'version': '1.0'}
        )

        results = []
        for file in files:
            image_obj = ImageModel.objects.create(file=file, uploaded_by=request.user)
            try:
                pred = predict(image_obj.file.path, model_type=model_type)
                species_obj = None
                if not pred['is_empty']:
                    species_obj, _ = Species.objects.get_or_create(
                        species_name=pred['species'],
                        defaults={'scientific_name': '', 'category': 'wildlife'}
                    )
                parts = file.name.split('_')
                site = parts[1] if len(parts) >= 2 else 'unknown'

                # Extract EXIF capture time
                captured_at = extract_exif_datetime(image_obj.file.path)

                prediction_obj = Prediction.objects.create(
                    image=image_obj,
                    species=species_obj,
                    model_used=ai_model,
                    confidence_score=pred['confidence'] / 100,
                    is_empty=pred['is_empty'],
                    time_of_day=pred.get('time_of_day', 'unknown'),
                    site=site,
                    captured_at=captured_at,
                )
                results.append({
                    'prediction_id': prediction_obj.id,
                    'image_id':      image_obj.id,
                    'filename':      file.name,
                    'image_url':     request.build_absolute_uri(image_obj.file.url),
                    'species':       pred['species'],
                    'confidence':    pred['confidence'],
                    'time_of_day':   pred['time_of_day'],
                    'site':          site,
                    'is_empty':      pred['is_empty'],
                    'top3':          pred['top3'],
                    'model_used':    model_display,
                    'notes':         prediction_obj.notes,
                    'predicted_at':  str(prediction_obj.predicted_at),
                    'captured_at':   str(captured_at) if captured_at else None,
                    'is_corrected':  False,
                })
            except Exception as e:
                results.append({
                    'image_id': image_obj.id,
                    'filename': file.name,
                    'error':    str(e),
                })

        return Response({'results': results}, status=status.HTTP_201_CREATED)


class MyPredictionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        images = ImageModel.objects.filter(uploaded_by=request.user).prefetch_related('predictions')
        data = []
        for image in images:
            # ── Only show predictions that are not hidden ──
            for pred in image.predictions.filter(is_hidden=False):
                data.append({
                    'image_id':     image.id,
                    'image_url':    request.build_absolute_uri(image.file.url),
                    'species':      pred.species.species_name if pred.species else 'empty',
                    'confidence':   round(pred.confidence_score * 100, 2),
                    'is_empty':     pred.is_empty,
                    'predicted_at': pred.predicted_at,
                })
        return Response(data)


class EditPredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, prediction_id):
        try:
            # ── Only allow editing visible (non-hidden) predictions ──
            pred = Prediction.objects.get(
                id=prediction_id,
                image__uploaded_by=request.user,
                is_hidden=False
            )
        except Prediction.DoesNotExist:
            return Response({'error': 'Prediction not found'}, status=404)

        new_species     = request.data.get('species')
        new_time_of_day = request.data.get('time_of_day')
        new_site        = request.data.get('site')
        new_notes       = request.data.get('notes')

        if new_species:
            if new_species == 'empty':
                pred.species  = None
                pred.is_empty = True
            else:
                species_obj, _ = Species.objects.get_or_create(
                    species_name=new_species,
                    defaults={'scientific_name': '', 'category': 'wildlife'}
                )
                pred.species  = species_obj
                pred.is_empty = False

        if new_time_of_day:
            pred.time_of_day = new_time_of_day
        if new_site is not None:
            pred.site = new_site
        if new_notes is not None:
            pred.notes = new_notes

        pred.is_corrected = True
        pred.save()

        return Response({
            'id':           pred.id,
            'species':      pred.species.species_name if pred.species else 'empty',
            'time_of_day':  pred.time_of_day,
            'site':         pred.site,
            'notes':        pred.notes,
            'is_corrected': pred.is_corrected,
        })


class InsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .models import InsightSettings
        cfg, _ = InsightSettings.objects.get_or_create(id=1)
        PREDATORS = cfg.get_predators()
        PREY      = cfg.get_prey()
        RARE      = cfg.get_rare()
        DIURNAL   = cfg.get_diurnal()
        NOCTURNAL = cfg.get_nocturnal()

        PREDATOR_THRESHOLD       = cfg.predator_threshold
        EMPTY_THRESHOLD          = cfg.empty_frame_threshold
        NOCTURNAL_THRESHOLD      = cfg.nocturnal_threshold
        LOW_CONF_THRESHOLD       = cfg.low_confidence_threshold
        MIN_DETECTIONS_NOCTURNAL = cfg.min_detections_nocturnal
        BIODIVERSITY_THRESHOLD   = cfg.biodiversity_threshold

        # ── Only show predictions that are not hidden ──
        preds = Prediction.objects.filter(
            image__uploaded_by=request.user,
            is_hidden=False
        ).select_related('species').order_by('captured_at', 'predicted_at')

        if not preds.exists():
            return Response({'insights': [], 'summary': {}, 'occupancy': [], 'cooccurrence': [], 'sequence': []})

        site_stats = defaultdict(lambda: {
            'total': 0, 'empty': 0, 'species': defaultdict(int),
            'night': 0, 'day': 0, 'low_confidence': 0
        })
        total           = 0
        species_total   = defaultdict(int)
        session_species = defaultdict(set)
        occupancy       = defaultdict(lambda: {'count': 0, 'sites': set(), 'last_seen': None, 'day': 0, 'night': 0})
        species_site_sequence = defaultdict(list)  # key: (site, species)
        anomalies       = []

        for p in preds:
            site = p.site or 'unknown'
            sp   = p.species.species_name if p.species else 'empty'
            conf = round(p.confidence_score * 100, 2)
            tod  = p.time_of_day

            site_stats[site]['total'] += 1
            total += 1
            species_total[sp] += 1

            if p.is_empty:
                site_stats[site]['empty'] += 1
            else:
                site_stats[site]['species'][sp] += 1

            if tod == 'night':
                site_stats[site]['night'] += 1
            elif tod == 'day':
                site_stats[site]['day'] += 1

            if conf < LOW_CONF_THRESHOLD:
                site_stats[site]['low_confidence'] += 1

            if not p.is_empty:
                occupancy[sp]['count'] += 1
                occupancy[sp]['sites'].add(site)
                ts = p.captured_at or p.predicted_at
                if occupancy[sp]['last_seen'] is None or ts > occupancy[sp]['last_seen']:
                    occupancy[sp]['last_seen'] = ts
                if tod == 'day':
                    occupancy[sp]['day'] += 1
                elif tod == 'night':
                    occupancy[sp]['night'] += 1

            session_key = f"{site}_{str(p.predicted_at.date()) if p.predicted_at else 'unknown'}"
            if not p.is_empty:
                session_species[session_key].add(sp)

            if not p.is_empty:
                if sp in DIURNAL and tod == 'night':
                    anomalies.append({
                        'type':    'warning',
                        'site':    site,
                        'title':   f'Unusual detection: {sp} at night',
                        'message': f'{sp.capitalize()} is primarily diurnal but was detected at night at {site} — this may warrant field investigation.',
                        'icon':    'anomaly',
                    })
                elif sp in NOCTURNAL and tod == 'day':
                    anomalies.append({
                        'type':    'warning',
                        'site':    site,
                        'title':   f'Unusual detection: {sp} during day',
                        'message': f'{sp.capitalize()} is primarily nocturnal but was detected during the day at {site} — this may warrant field investigation.',
                        'icon':    'anomaly',
                    })

            if not p.is_empty and (p.captured_at or p.predicted_at):
                ts = p.captured_at or p.predicted_at
                species_site_sequence[(site, sp)].append({
                    'time':      ts,
                    'image_url': request.build_absolute_uri(p.image.file.url),
                })

        insights = []

        for site, s in site_stats.items():
            if s['total'] == 0:
                continue

            empty_rate     = s['empty'] / s['total']
            predator_count = sum(s['species'].get(p, 0) for p in PREDATORS)
            rare_count     = sum(s['species'].get(r, 0) for r in RARE)
            night_rate     = s['night'] / s['total'] if s['total'] > 0 else 0

            if empty_rate > EMPTY_THRESHOLD:
                insights.append({
                    'type':    'warning', 'site': site, 'icon': 'camera',
                    'title':   f'Possible camera issue at {site}',
                    'message': f'{round(empty_rate * 100)}% of frames at {site} are empty — camera may be mispositioned or triggered by wind/vegetation.',
                })

            if predator_count >= PREDATOR_THRESHOLD:
                insights.append({
                    'type':    'alert', 'site': site, 'icon': 'predator',
                    'title':   f'High predator activity at {site}',
                    'message': f'{predator_count} predator detections at {site} — possible prey concentration or territorial behaviour. Recommend field check.',
                })

            if rare_count > 0:
                rare_found = [r for r in RARE if s['species'].get(r, 0) > 0]
                insights.append({
                    'type':    'info', 'site': site, 'icon': 'rare',
                    'title':   f'Rare species detected at {site}',
                    'message': f'{", ".join(rare_found)} detected at {site} — recommend field verification to confirm sighting.',
                })

            if night_rate > NOCTURNAL_THRESHOLD and s['total'] >= MIN_DETECTIONS_NOCTURNAL:
                insights.append({
                    'type':    'info', 'site': site, 'icon': 'night',
                    'title':   f'Primarily nocturnal activity at {site}',
                    'message': f'{round(night_rate * 100)}% of detections at {site} are at night — species may be avoiding daytime human activity.',
                })

            if s['low_confidence'] >= 2:
                insights.append({
                    'type':    'warning', 'site': site, 'icon': 'confidence',
                    'title':   f'Low confidence predictions at {site}',
                    'message': f'{s["low_confidence"]} predictions at {site} have confidence below {int(LOW_CONF_THRESHOLD)}% — consider reviewing and correcting these.',
                })

        if total > 0:
            for sp, count in species_total.items():
                if sp == 'empty':
                    continue
                if count / total > BIODIVERSITY_THRESHOLD:
                    insights.append({
                        'type':    'info', 'site': 'all', 'icon': 'biodiversity',
                        'title':   'Low biodiversity detected',
                        'message': f'{sp.capitalize()} accounts for {round(count/total*100)}% of all detections — low species diversity may indicate habitat pressure.',
                    })

        seen_anomalies = set()
        for a in anomalies:
            key = (a['title'], a['site'])
            if key not in seen_anomalies:
                insights.append(a)
                seen_anomalies.add(key)

        cooccurrence = []
        for session, species_set in session_species.items():
            predators_present = species_set & PREDATORS
            prey_present      = species_set & PREY
            if predators_present and prey_present:
                site_part, date_part = session.rsplit('_', 1)
                cooccurrence.append({
                    'session':   date_part,
                    'site':      site_part,
                    'predators': list(predators_present),
                    'prey':      list(prey_present),
                    'message':   f'On {date_part} at {site_part}: {", ".join(predators_present)} and {", ".join(prey_present)} detected at the same location — possible predator-prey interaction.',
                })

        occupancy_list = []
        for sp, data in sorted(occupancy.items(), key=lambda x: -x[1]['count']):
            last = data['last_seen']
            occupancy_list.append({
                'species':   sp,
                'count':     data['count'],
                'sites':     list(data['sites']),
                'last_seen': str(last.date()) if last else 'unknown',
                'day':       data['day'],
                'night':     data['night'],
            })

        sequence_list = []
        for (site, sp), detections in species_site_sequence.items():
            if len(detections) < 2:
                continue
            sorted_detections = sorted(detections, key=lambda x: x['time'])
            frames = [
                {
                    'time':      str(d['time']),
                    'image_url': d['image_url'],
                }
                for d in sorted_detections
            ]
            acc_duration = (sorted_detections[-1]['time'] - sorted_detections[0]['time'])
            duration_mins = int(acc_duration.total_seconds() / 60) if hasattr(acc_duration, 'total_seconds') else 0
            sequence_list.append({
                'site':     site,
                'species':  sp,
                'frames':   frames,
                'count':    len(frames),
                'duration_mins': duration_mins,
                'message':  f'{sp.capitalize()} detected {len(frames)} times at {site}',
            })
        sequence_list.sort(key=lambda x: -x['count'])

        summary = {
            'total_predictions': total,
            'total_sites':       len(site_stats),
            'species_breakdown': dict(species_total),
        }

        return Response({
            'insights':     insights,
            'summary':      summary,
            'occupancy':    occupancy_list,
            'cooccurrence': cooccurrence,
            'sequence':     sequence_list,
        })


class ClearPredictionsView(APIView):
    """
    Conservationist clear — sets is_hidden=True on the user's predictions.
    Images and prediction records stay in the DB so admin stats remain intact.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        updated = Prediction.objects.filter(
            image__uploaded_by=request.user,
            is_hidden=False
        ).update(is_hidden=True)
        return Response({
            'message': f'Cleared {updated} predictions from your history.'
        })


class AdminClearView(APIView):
    """
    Admin clear — hard deletes the admin's own images and predictions only.
    Never touches any other user's data.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        if not request.user.is_admin:
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)
        images = ImageModel.objects.filter(uploaded_by=request.user)
        deleted_count = images.count()
        images.delete()
        return Response({
            'message': f'Cleared {deleted_count} uploads and all associated predictions.'
        })


import zipfile
import tempfile
import os
from pathlib import Path

class UploadZipAndPredictView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'}

    def post(self, request):
        zip_file = request.FILES.get('zip_file')
        if not zip_file:
            return Response({'error': 'No ZIP file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        if not zip_file.name.lower().endswith('.zip'):
            return Response({'error': 'Uploaded file must be a ZIP archive.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            deployed = MLModel.objects.get(status='deployed')
        except MLModel.DoesNotExist:
            return Response(
                {'error': 'No model is currently deployed. Please contact the administrator.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        weight = deployed.weight_file.lower()
        if 'resnet' in weight:
            model_type = 'resnet'
        elif 'efficientnet' in weight:
            model_type = 'efficientnet'
        else:
            return Response(
                {'error': 'Deployed model type is not recognised.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        model_display = deployed.name
        ai_model, _ = AIModel.objects.get_or_create(
            model_name=model_display,
            defaults={'version': '1.0'}
        )

        results = []

        with tempfile.TemporaryDirectory() as tmpdir:
            try:
                with zipfile.ZipFile(zip_file, 'r') as zf:
                    zf.extractall(tmpdir)
            except zipfile.BadZipFile:
                return Response({'error': 'Invalid or corrupted ZIP file.'}, status=status.HTTP_400_BAD_REQUEST)

            # Walk all extracted files recursively
            image_paths = []
            for root, dirs, files in os.walk(tmpdir):
                # Skip hidden/system folders like __MACOSX
                dirs[:] = [d for d in dirs if not d.startswith('__') and not d.startswith('.')]
                for filename in files:
                    if filename.startswith('.') or filename.startswith('__'):
                        continue
                    ext = Path(filename).suffix.lower()
                    if ext in self.ALLOWED_EXTENSIONS:
                        image_paths.append((os.path.join(root, filename), filename))

            if not image_paths:
                return Response({'error': 'No valid image files found in the ZIP archive.'}, status=status.HTTP_400_BAD_REQUEST)

            for filepath, filename in image_paths:
                try:
                    with open(filepath, 'rb') as f:
                        from django.core.files.uploadedfile import InMemoryUploadedFile
                        import io
                        file_data = f.read()
                        django_file = InMemoryUploadedFile(
                            file=io.BytesIO(file_data),
                            field_name='file',
                            name=filename,
                            content_type='image/jpeg',
                            size=len(file_data),
                            charset=None,
                        )
                        image_obj = ImageModel.objects.create(
                            file=django_file,
                            uploaded_by=request.user
                        )

                    pred = predict(image_obj.file.path, model_type=model_type)

                    species_obj = None
                    if not pred['is_empty']:
                        species_obj, _ = Species.objects.get_or_create(
                            species_name=pred['species'],
                            defaults={'scientific_name': '', 'category': 'wildlife'}
                        )

                    parts = filename.split('_')
                    site = parts[1] if len(parts) >= 2 else 'unknown'

                    captured_at = extract_exif_datetime(image_obj.file.path)

                    prediction_obj = Prediction.objects.create(
                        image=image_obj,
                        species=species_obj,
                        model_used=ai_model,
                        confidence_score=pred['confidence'] / 100,
                        is_empty=pred['is_empty'],
                        time_of_day=pred.get('time_of_day', 'unknown'),
                        site=site,
                        captured_at=captured_at,
                    )

                    results.append({
                        'prediction_id': prediction_obj.id,
                        'image_id':      image_obj.id,
                        'filename':      filename,
                        'image_url':     request.build_absolute_uri(image_obj.file.url),
                        'species':       pred['species'],
                        'confidence':    pred['confidence'],
                        'time_of_day':   pred['time_of_day'],
                        'site':          site,
                        'is_empty':      pred['is_empty'],
                        'top3':          pred['top3'],
                        'model_used':    model_display,
                        'notes':         prediction_obj.notes,
                        'predicted_at':  str(prediction_obj.predicted_at),
                        'captured_at':   str(captured_at) if captured_at else None,
                        'is_corrected':  False,
                    })

                except Exception as e:
                    results.append({
                        'filename': filename,
                        'error':    str(e),
                    })

        return Response({'results': results}, status=status.HTTP_201_CREATED)




class InsightSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings, _ = InsightSettings.objects.get_or_create(id=1)
        return Response({
            'predator_threshold':       settings.predator_threshold,
            'empty_frame_threshold':    settings.empty_frame_threshold,
            'nocturnal_threshold':      settings.nocturnal_threshold,
            'low_confidence_threshold': settings.low_confidence_threshold,
            'min_detections_nocturnal': settings.min_detections_nocturnal,
            'biodiversity_threshold':   settings.biodiversity_threshold,
            'predator_species':         settings.predator_species,
            'prey_species':             settings.prey_species,
            'rare_species':             settings.rare_species,
            'diurnal_species':          settings.diurnal_species,
            'nocturnal_species':        settings.nocturnal_species,
        })

    def patch(self, request):
        from model_management.permissions import IsSystemAdmin
        if not request.user.is_admin:
            return Response({'error': 'Admin only'}, status=403)
        settings, _ = InsightSettings.objects.get_or_create(id=1)
        fields = [
            'predator_threshold', 'empty_frame_threshold', 'nocturnal_threshold',
            'low_confidence_threshold', 'min_detections_nocturnal', 'biodiversity_threshold',
            'predator_species', 'prey_species', 'rare_species',
            'diurnal_species', 'nocturnal_species',
        ]
        for field in fields:
            if field in request.data:
                setattr(settings, field, request.data[field])
        settings.save()
        return Response({'message': 'Settings updated successfully.'})