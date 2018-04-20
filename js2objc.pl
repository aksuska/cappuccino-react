#!/usr/bin/perl

$| = 1;

our($typeSpec, $inClass) = ('', 0);

while(<>) {
	if (m#^\s*(/(?:\*[*!]|/[!/]))#) {
		my $comment = loadComment($1, $_);
		# check for our directives
		if ($comment =~ s#^([/*!\s]*)(\@property\s*\(.*)#${1}<B>Declaration:</B> \@code $2 \@endcode#m) {
			print "$comment$2;\n";
		}
		elsif($comment =~ s#^[/*\s!]*\@typed\s+(.*)\n##m) {
			$typeSpec = $1;
			print $comment;
		}
		else {
			print $comment;
		}
	}
	elsif(/^export\s+(const\s+[a-z_0-9]+)\s*=\s*/i)
	{
		print "$typeSpec $1;\n";
	}
	elsif (/^export(?: default)?\s+class\s+([a-z\$_]+)(?:\s+extends\s+([a-z\$_]+))?\s*{/i) {
		$inClass = 1;
		print "\@interface $1" . ($2 ? " : $2" : "") . " {}\n";
	}
	elsif (/^\s+[gs]et [a-z_0-9]+\s*\(/i || /^\s+constructor\s*\(/i) {
		# ignore getters & setters & constructor
		consumeBlock($_);
	}
	elsif ($inClass && /^\s+(?:(static)\s+)?([a-z_0-9\$]+)\s*\((.*)\)/i) {
		my ($type, $name, $args) = ($1, $2, $3);
		# skip private
		if ($name =~ /^\$/) {
			consumeBlock($_);
			next;
		}
		my @parts = split /_/, $name;
		my @args = split /,\s*/, $args;
		my ($returnType, $argTypes) = split(/\s*:\s*/, $typeSpec);
		my @argTypes = getTypeList($argTypes);
		print ($type ? '+' : '-');
		print " ($returnType)";
		if (@args) {
			my @named = ();
			foreach $part (@parts) {
				push @named, "$part:(".shift(@argTypes).")".shift(@args);
			}
			print join(' ', @named);
			# check for var arg
			if (@args && @argTypes && $args[0] =~ /^\.\.\./) {
				print ", ...";
			}
		}
		else {
			print $name;
		}
		print ";\n";
		consumeBlock($_);
	}
	elsif ($inClass && /^}/) {
		$inClass = 0;
		print "\@end\n";
	}
	elsif (/^export\s+function\s+([a-z_0-9]+)\s*\((.*)\)/i) {
		my ($name, $args) = ($1, $2);
		my @args = split /,\s*/, $args;
		my ($returnType, $argTypes) = split(/\s*:\s*/, $typeSpec);
		my @argTypes = getTypeList($argTypes);
		print "($returnType)$name(";
		if (@args) {
			my @typed = ();
			foreach $arg (@args) {
				push @typed, shift(@argTypes)." ".$arg;
			}
			print join(', ', @typed);
		}
		elsif(@argTypes) {
			print shift(@argTypes);
		}
		print ");\n";
		consumeBlock($_);
	}
}

sub loadComment {
	my ($type, $comment) = @_;
	if ($type =~ m#^/\*#) {
		while ($comment !~ m#\*/#) {
			$comment .= <>;
		}
	}
	return $comment;
}

sub getTypeList {
	my $argTypes = shift;
	
	return $argTypes =~ /((?:[a-z_0-9@.]+\s+\(\^\)\s*\([^)]+\))|[a-z_0-9@.]+)/ig;
}

sub consumeBlock {
	my $line = shift;
	# check one-line block
	return if $line =~ /}\s*$/;
	
	# we will use indent to determine the closing block
	$line =~ /^(\s*)/;
	my $indent = $1;
	do {
		$line = <>;
	} while($line !~ /^$indent}\s*$/ && !eof);
}
