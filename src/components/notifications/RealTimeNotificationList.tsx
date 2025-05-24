"use client";

import React, { useState } from 'react';
import {
	List,
	ListItem,
	ListItemText,
	Typography,
	Box,
	IconButton,
	Card,
	CardContent,
	Badge,
	Divider,
	useTheme,
	Chip,
} from '@mui/material';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import {
	Bell as BellIcon,
	CheckCircle2 as CheckIcon,
	Trash2 as DeleteIcon,
	X as CloseIcon,
	AlertCircle as ErrorIcon,
	CheckCircle2 as SuccessIcon,
	Wifi as ConnectedIcon,
	WifiOff as DisconnectedIcon,
} from 'lucide-react';

interface RealTimeNotificationListProps {
	onClose?: () => void;
	maxItems?: number;
}

const RealTimeNotificationList: React.FC<RealTimeNotificationListProps> = ({ 
	onClose, 
	maxItems = 10 
}) => {
	const theme = useTheme();
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
	
	const {
		recentNotifications,
		unreadCount,
		isConnected,
		connectionStatus,
		markAsRead,
		markAllAsRead,
		isLoading,
		error
	} = useRealTimeNotifications();

	const displayNotifications = recentNotifications.slice(0, maxItems);

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			markAsRead(notificationId);
			setToast({ message: 'Notification marked as read', type: 'success' });
			setTimeout(() => setToast(null), 3000);
		} catch (error) {
			setToast({ message: 'Failed to mark notification as read', type: 'error' });
			setTimeout(() => setToast(null), 3000);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			markAllAsRead();
			setToast({ message: 'All notifications marked as read', type: 'success' });
			setTimeout(() => setToast(null), 3000);
		} catch (error) {
			setToast({ message: 'Failed to mark all notifications as read', type: 'error' });
			setTimeout(() => setToast(null), 3000);
		}
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case 'DONATION_RECEIVED':
				return '💰';
			case 'DONATION_STATUS_UPDATED':
				return '📋';
			case 'CAMPAIGN_CREATED':
			case 'CAMPAIGN_UPDATED':
				return '📢';
			case 'FEEDBACK_RECEIVED':
			case 'FEEDBACK_RESPONSE':
				return '💬';
			case 'SYSTEM_NOTIFICATION':
				return '⚙️';
			default:
				return '🔔';
		}
	};

	const getNotificationColor = (type: string) => {
		switch (type) {
			case 'DONATION_RECEIVED':
				return theme.palette.success.main;
			case 'DONATION_STATUS_UPDATED':
				return theme.palette.info.main;
			case 'CAMPAIGN_CREATED':
			case 'CAMPAIGN_UPDATED':
				return theme.palette.primary.main;
			case 'FEEDBACK_RECEIVED':
			case 'FEEDBACK_RESPONSE':
				return theme.palette.warning.main;
			case 'SYSTEM_NOTIFICATION':
				return theme.palette.secondary.main;
			default:
				return theme.palette.grey[500];
		}
	};

	if (isLoading) {
		return (
			<Card sx={{ width: 400, maxHeight: 500 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Loading notifications...
					</Typography>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card sx={{ width: 400, maxHeight: 500 }}>
				<CardContent>
					<Typography variant="h6" color="error" gutterBottom>
						Error loading notifications
					</Typography>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card sx={{ width: 400, maxHeight: 500, overflow: 'hidden' }}>
			{/* Header */}
			<Box
				sx={{
					p: 2,
					borderBottom: 1,
					borderColor: 'divider',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<BellIcon size={20} />
					<Typography variant="h6" fontFamily="'Inter', sans-serif">
						Notifications
					</Typography>
					{unreadCount > 0 && (
						<Badge badgeContent={unreadCount} color="error" />
					)}
				</Box>
				
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					{/* Connection status indicator */}
					<Chip
						icon={isConnected ? <ConnectedIcon size={16} /> : <DisconnectedIcon size={16} />}
						label={connectionStatus}
						size="small"
						color={isConnected ? 'success' : 'error'}
						variant="outlined"
					/>
					
					{unreadCount > 0 && (
						<IconButton
							size="small"
							onClick={handleMarkAllAsRead}
							title="Mark all as read"
						>
							<CheckIcon size={16} />
						</IconButton>
					)}
					
					{onClose && (
						<IconButton size="small" onClick={onClose}>
							<CloseIcon size={16} />
						</IconButton>
					)}
				</Box>
			</Box>

			{/* Notifications List */}
			<Box sx={{ maxHeight: 400, overflow: 'auto' }}>
				{displayNotifications.length === 0 ? (
					<Box sx={{ p: 3, textAlign: 'center' }}>
						<BellIcon size={48} color={theme.palette.grey[400]} />
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							No notifications yet
						</Typography>
					</Box>
				) : (
					<List sx={{ p: 0 }}>
						{displayNotifications.map((notification, index) => (
							<React.Fragment key={notification.id}>
								<ListItem
									sx={{
										py: 1.5,
										px: 2,
										bgcolor: notification.isRead ? 'transparent' : 'action.hover',
										'&:hover': {
											bgcolor: 'action.selected',
										},
									}}
								>
									<Box sx={{ mr: 2, fontSize: '1.5rem' }}>
										{getNotificationIcon(notification.type)}
									</Box>
									
									<ListItemText
										primary={
											<Typography
												variant="subtitle2"
												fontFamily="'Inter', sans-serif"
												sx={{
													fontWeight: notification.isRead ? 400 : 600,
													color: notification.isRead ? 'text.secondary' : 'text.primary',
												}}
											>
												{notification.title}
											</Typography>
										}
										secondary={
											<Box>
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{ mb: 0.5 }}
												>
													{notification.message}
												</Typography>
												<Typography variant="caption" color="text.disabled">
													{formatDistanceToNow(new Date(notification.createdAt), {
														addSuffix: true,
													})}
												</Typography>
											</Box>
										}
									/>
									
									{!notification.isRead && (
										<IconButton
											size="small"
											onClick={() => handleMarkAsRead(notification.id)}
											sx={{ ml: 1 }}
										>
											<CheckIcon size={16} />
										</IconButton>
									)}
								</ListItem>
								
								{index < displayNotifications.length - 1 && <Divider />}
							</React.Fragment>
						))}
					</List>
				)}
			</Box>

			{/* Toast notification */}
			{toast && (
				<Box
					sx={{
						position: 'absolute',
						top: 16,
						left: '50%',
						transform: 'translateX(-50%)',
						px: 3,
						py: 1.5,
						borderRadius: 2,
						bgcolor: toast.type === 'success' ? 'success.light' : 'error.light',
						color: toast.type === 'success' ? 'success.contrastText' : 'error.contrastText',
						boxShadow: 3,
						zIndex: 1000,
						display: 'flex',
						alignItems: 'center',
						gap: 1,
					}}
				>
					{toast.type === 'success' ? (
						<SuccessIcon size={18} />
					) : (
						<ErrorIcon size={18} />
					)}
					<Typography variant="body2" fontFamily="'Inter', sans-serif">
						{toast.message}
					</Typography>
				</Box>
			)}
		</Card>
	);
};

export default RealTimeNotificationList;
