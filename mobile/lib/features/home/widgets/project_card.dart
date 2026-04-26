import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/project.dart';

class ProjectCard extends StatelessWidget {
  const ProjectCard({super.key, required this.project, required this.onTap});

  final Project project;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      child: Container(
        decoration: BoxDecoration(
          color: context.theme.cardTheme.color,
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          border: Border.all(color: context.colors.outline),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppSpacing.radiusLg),
              ),
              child: AspectRatio(
                aspectRatio: 16 / 10,
                child: project.originalImageUrl.isEmpty
                    ? Container(
                        color: context.colors.surface,
                        child: Icon(
                          Icons.image_outlined,
                          size: 48,
                          color: context.colors.outline,
                        ),
                      )
                    : CachedNetworkImage(
                        imageUrl: project.originalImageUrl,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(
                          color: context.colors.surface,
                        ),
                        errorWidget: (_, __, ___) => Container(
                          color: context.colors.surface,
                          alignment: Alignment.center,
                          child: const Icon(Icons.broken_image_outlined),
                        ),
                      ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    project.name,
                    style: context.text.titleMedium,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  AppSpacing.vXs,
                  Row(
                    children: [
                      Icon(Icons.bedroom_parent_outlined,
                          size: 14, color: context.text.bodySmall?.color),
                      const SizedBox(width: 4),
                      Text(project.roomType, style: context.text.bodySmall),
                      const Spacer(),
                      if (project.createdAt != null)
                        Text(
                          Formatters.timeAgo(project.createdAt!),
                          style: context.text.bodySmall,
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
